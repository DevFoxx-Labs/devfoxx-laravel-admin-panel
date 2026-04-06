<?php

namespace App\Jobs;

use App\Models\NotificationDelivery;
use App\Services\Notifications\NotificationChannelManager;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RetryNotificationDeliveryJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $deliveryId,
    ) {
        $this->onQueue(config('notification_channels.queue', 'notifications'));
    }

    public function handle(NotificationChannelManager $channelManager): void
    {
        $delivery = NotificationDelivery::query()
            ->with([
                'campaign',
                'user.pushDevices' => fn ($query) => $query->active(),
            ])
            ->find($this->deliveryId);

        if (! $delivery || ! $delivery->campaign || ! $delivery->user) {
            return;
        }

        $result = $channelManager->send($delivery->channel, $delivery->campaign, $delivery->user);

        $delivery->forceFill([
            'status' => $result['status'],
            'provider' => $result['provider'],
            'provider_reference' => $result['provider_reference'],
            'external_status' => $result['external_status'],
            'error_message' => $result['error_message'],
            'payload' => $result['payload'],
            'attempt_count' => $delivery->attempt_count + 1,
            'last_attempted_at' => now(),
            'sent_at' => $result['status'] === 'sent' ? now() : $delivery->sent_at,
            'delivered_at' => in_array($result['external_status'], ['delivered', 'sent', 'logged', 'submitted'], true)
                ? now()
                : $delivery->delivered_at,
            'failed_at' => $result['status'] === 'failed' ? now() : null,
        ])->save();
    }
}
