<?php

namespace App\Services\Notifications\Channels;

use App\Models\NotificationCampaign;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushChannel
{
    public function destination(User $user): ?string
    {
        $count = $user->pushDevices->where('active', true)->count();

        return $count > 0 ? "devices:{$count}" : null;
    }

    public function send(NotificationCampaign $campaign, User $user, array $content): array
    {
        $tokens = $user->pushDevices
            ->where('active', true)
            ->pluck('token')
            ->values()
            ->all();

        if ($tokens === []) {
            return [
                'status' => 'skipped',
                'provider' => 'push',
                'provider_reference' => null,
                'external_status' => 'missing_destination',
                'error_message' => 'User does not have any active push devices.',
                'payload' => null,
            ];
        }

        $driver = config('notification_channels.push.driver', 'log');

        if ($driver === 'log') {
            Log::info('Simulated push notification delivery.', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'device_count' => count($tokens),
            ]);

            return [
                'status' => 'sent',
                'provider' => 'log',
                'provider_reference' => 'push-log',
                'external_status' => 'logged',
                'error_message' => null,
                'payload' => ['driver' => 'log', 'device_count' => count($tokens)],
            ];
        }

        if ($driver !== 'onesignal') {
            return [
                'status' => 'failed',
                'provider' => $driver,
                'provider_reference' => null,
                'external_status' => 'unsupported_driver',
                'error_message' => 'Unsupported push driver configured.',
                'payload' => ['driver' => $driver],
            ];
        }

        $appId = config('services.onesignal.app_id');
        $apiKey = config('services.onesignal.rest_api_key');

        if (! $appId || ! $apiKey) {
            return [
                'status' => 'failed',
                'provider' => 'onesignal',
                'provider_reference' => null,
                'external_status' => 'configuration_error',
                'error_message' => 'OneSignal credentials are incomplete.',
                'payload' => null,
            ];
        }

        $response = Http::withHeaders([
            'Authorization' => "Key {$apiKey}",
            'Accept' => 'application/json',
        ])->post('https://onesignal.com/api/v1/notifications', [
            'app_id' => $appId,
            'include_subscription_ids' => $tokens,
            'headings' => [
                'en' => $content['subject'] ?: $campaign->title,
            ],
            'contents' => [
                'en' => $content['message'],
            ],
            'url' => $content['action_url'],
            'data' => [
                'campaign_id' => $campaign->id,
            ],
        ]);

        if ($response->failed()) {
            return [
                'status' => 'failed',
                'provider' => 'onesignal',
                'provider_reference' => null,
                'external_status' => 'request_failed',
                'error_message' => $response->json('errors.0') ?: 'OneSignal push request failed.',
                'payload' => $response->json(),
            ];
        }

        return [
            'status' => 'sent',
            'provider' => 'onesignal',
            'provider_reference' => $response->json('id'),
            'external_status' => 'queued',
            'error_message' => null,
            'payload' => $response->json(),
        ];
    }
}