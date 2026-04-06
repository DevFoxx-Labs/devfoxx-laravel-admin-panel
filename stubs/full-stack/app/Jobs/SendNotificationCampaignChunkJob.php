<?php

namespace App\Jobs;

use App\Models\NotificationCampaign;
use App\Models\NotificationDelivery;
use App\Models\User;
use App\Services\Notifications\NotificationChannelManager;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class SendNotificationCampaignChunkJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $campaignId,
        public array $userIds,
    ) {
        $this->onQueue(config('notification_channels.queue', 'notifications'));
    }

    public function handle(NotificationChannelManager $channelManager): void
    {
        $campaign = NotificationCampaign::query()->find($this->campaignId);

        if (! $campaign || $campaign->status === 'cancelled') {
            return;
        }

        $users = User::query()
            ->with(['pushDevices' => fn ($query) => $query->active()])
            ->whereIn('id', $this->userIds)
            ->get()
            ->keyBy('id');

        $processed = 0;
        $sent = 0;
        $failed = 0;
        $skipped = 0;

        foreach ($this->userIds as $userId) {
            $user = $users->get($userId);

            if (! $user) {
                continue;
            }

            $processed++;
            $statuses = [];

            foreach ($campaign->channels as $channel) {
                $delivery = NotificationDelivery::create([
                    'notification_campaign_id' => $campaign->id,
                    'user_id' => $user->id,
                    'channel' => $channel,
                    'destination' => $channelManager->resolveDestination($channel, $user),
                    'status' => 'pending',
                    'attempt_count' => 0,
                ]);

                $result = $channelManager->send($channel, $campaign, $user);
                $statuses[] = $result['status'];

                $delivery->forceFill([
                    'status' => $result['status'],
                    'provider' => $result['provider'],
                    'provider_reference' => $result['provider_reference'],
                    'external_status' => $result['external_status'],
                    'error_message' => $result['error_message'],
                    'payload' => $result['payload'],
                    'attempt_count' => 1,
                    'last_attempted_at' => now(),
                    'sent_at' => $result['status'] === 'sent' ? now() : null,
                    'delivered_at' => in_array($result['external_status'], ['delivered', 'sent', 'logged', 'submitted'], true)
                        ? now()
                        : null,
                    'failed_at' => $result['status'] === 'failed' ? now() : null,
                ])->save();
            }

            if (in_array('sent', $statuses, true)) {
                $sent++;
            } elseif ($statuses !== [] && count(array_unique($statuses)) === 1 && $statuses[0] === 'skipped') {
                $skipped++;
            } else {
                $failed++;
            }
        }

        NotificationCampaign::query()
            ->whereKey($campaign->id)
            ->update([
                'processed_recipients' => DB::raw('processed_recipients + '.(int) $processed),
                'sent_recipients' => DB::raw('sent_recipients + '.(int) $sent),
                'failed_recipients' => DB::raw('failed_recipients + '.(int) $failed),
                'skipped_recipients' => DB::raw('skipped_recipients + '.(int) $skipped),
            ]);

        $campaign->refresh();

        if ($campaign->status !== 'cancelled' && $campaign->processed_recipients >= $campaign->total_recipients) {
            $campaign->forceFill([
                'status' => 'completed',
                'completed_at' => now(),
            ])->save();
        }
    }
}