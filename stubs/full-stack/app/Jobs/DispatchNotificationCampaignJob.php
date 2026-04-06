<?php

namespace App\Jobs;

use App\Models\NotificationCampaign;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DispatchNotificationCampaignJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $campaignId,
    ) {
        $this->onQueue(config('notification_channels.queue', 'notifications'));
    }

    public function handle(): void
    {
        $campaign = NotificationCampaign::query()->find($this->campaignId);

        if (! $campaign || in_array($campaign->status, ['cancelled', 'completed'], true)) {
            return;
        }

        $query = $campaign->targetedUsersQuery();
        $totalRecipients = (clone $query)->count();

        $campaign->forceFill([
            'status' => 'processing',
            'started_at' => $campaign->started_at ?: now(),
            'total_recipients' => $totalRecipients,
        ])->save();

        if ($totalRecipients === 0) {
            $campaign->forceFill([
                'status' => 'completed',
                'completed_at' => now(),
            ])->save();

            return;
        }

        $chunkSize = max(1, (int) config('notification_channels.dispatch_chunk_size', 1000));

        $query
            ->select('users.id')
            ->orderBy('users.id')
            ->chunkById($chunkSize, function ($users) use ($campaign) {
                SendNotificationCampaignChunkJob::dispatch(
                    $campaign->id,
                    $users->pluck('id')->all(),
                )->onQueue(config('notification_channels.queue', 'notifications'));
            });
    }
}