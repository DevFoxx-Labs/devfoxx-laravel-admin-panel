<?php

namespace App\Services\Notifications\Channels;

use App\Models\NotificationCampaign;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class WhatsAppChannel
{
    public function destination(User $user): ?string
    {
        return $user->whatsapp_number ?: $user->phone_number ?: null;
    }

    public function send(NotificationCampaign $campaign, User $user, array $content): array
    {
        $destination = $this->destination($user);

        if (! $destination) {
            return [
                'status' => 'skipped',
                'provider' => 'whatsapp',
                'provider_reference' => null,
                'external_status' => 'missing_destination',
                'error_message' => 'User does not have a WhatsApp-enabled number.',
                'payload' => null,
            ];
        }

        $driver = config('notification_channels.whatsapp.driver', 'log');

        if ($driver === 'log') {
            Log::info('Simulated WhatsApp notification delivery.', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'to' => $destination,
            ]);

            return [
                'status' => 'sent',
                'provider' => 'log',
                'provider_reference' => 'whatsapp-log',
                'external_status' => 'logged',
                'error_message' => null,
                'payload' => ['driver' => 'log'],
            ];
        }

        if ($driver !== 'twilio') {
            return [
                'status' => 'failed',
                'provider' => $driver,
                'provider_reference' => null,
                'external_status' => 'unsupported_driver',
                'error_message' => 'Unsupported WhatsApp driver configured.',
                'payload' => ['driver' => $driver],
            ];
        }

        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.whatsapp_from');

        if (! $sid || ! $token || ! $from) {
            return [
                'status' => 'failed',
                'provider' => 'twilio',
                'provider_reference' => null,
                'external_status' => 'configuration_error',
                'error_message' => 'Twilio WhatsApp credentials are incomplete.',
                'payload' => null,
            ];
        }

        $callbackSecret = config('services.twilio.webhook_secret');
        $callbackUrl = $callbackSecret
            ? URL::route('webhooks.notifications.twilio', ['secret' => $callbackSecret])
            : null;

        $response = Http::asForm()
            ->withBasicAuth($sid, $token)
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", array_filter([
                'From' => str_starts_with($from, 'whatsapp:') ? $from : "whatsapp:{$from}",
                'To' => str_starts_with($destination, 'whatsapp:') ? $destination : "whatsapp:{$destination}",
                'Body' => $content['message'],
                'StatusCallback' => $callbackUrl,
            ]));

        if ($response->failed()) {
            return [
                'status' => 'failed',
                'provider' => 'twilio',
                'provider_reference' => null,
                'external_status' => 'request_failed',
                'error_message' => $response->json('message') ?: 'Twilio WhatsApp request failed.',
                'payload' => $response->json(),
            ];
        }

        return [
            'status' => 'sent',
            'provider' => 'twilio',
            'provider_reference' => $response->json('sid'),
            'external_status' => $response->json('status', 'queued'),
            'error_message' => null,
            'payload' => $response->json(),
        ];
    }
}