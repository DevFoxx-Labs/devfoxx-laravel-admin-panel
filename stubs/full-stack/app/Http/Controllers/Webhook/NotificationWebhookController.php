<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\NotificationDelivery;
use App\Models\NotificationWebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationWebhookController extends Controller
{
    public function twilio(Request $request): JsonResponse
    {
        $this->ensureSecretMatches($request->query('secret'), config('services.twilio.webhook_secret'));

        $providerReference = $request->string('MessageSid')->toString();
        $eventType = $request->string('MessageStatus')->toString();

        $event = NotificationWebhookEvent::create([
            'provider' => 'twilio',
            'event_type' => $eventType,
            'provider_reference' => $providerReference,
            'headers' => $request->headers->all(),
            'payload' => $request->all(),
            'status' => 'received',
        ]);

        $delivery = NotificationDelivery::query()
            ->where('provider', 'twilio')
            ->where('provider_reference', $providerReference)
            ->latest('id')
            ->first();

        if (! $delivery) {
            $event->forceFill([
                'status' => 'unmatched',
                'notes' => 'No notification delivery matched the Twilio provider reference.',
                'processed_at' => now(),
            ])->save();

            return response()->json(['ok' => true]);
        }

        [$status, $failedAt, $deliveredAt] = match ($eventType) {
            'delivered', 'read' => ['delivered', null, now()],
            'failed', 'undelivered' => ['failed', now(), null],
            default => ['sent', null, $delivery->delivered_at],
        };

        $delivery->forceFill([
            'status' => $status,
            'external_status' => $eventType,
            'error_message' => $request->string('ErrorMessage')->toString() ?: $delivery->error_message,
            'last_webhook_at' => now(),
            'failed_at' => $failedAt,
            'delivered_at' => $deliveredAt,
        ])->save();

        $event->forceFill([
            'notification_delivery_id' => $delivery->id,
            'status' => 'processed',
            'processed_at' => now(),
        ])->save();

        return response()->json(['ok' => true]);
    }

    public function oneSignal(Request $request): JsonResponse
    {
        $this->ensureSecretMatches($request->query('secret'), config('services.onesignal.webhook_secret'));

        $payload = $request->all();
        $providerReference = (string) ($payload['notification_id'] ?? $payload['id'] ?? '');
        $eventType = (string) ($payload['event'] ?? $payload['type'] ?? 'unknown');

        $event = NotificationWebhookEvent::create([
            'provider' => 'onesignal',
            'event_type' => $eventType,
            'provider_reference' => $providerReference,
            'headers' => $request->headers->all(),
            'payload' => $payload,
            'status' => 'received',
        ]);

        $delivery = NotificationDelivery::query()
            ->where('provider', 'onesignal')
            ->where('provider_reference', $providerReference)
            ->latest('id')
            ->first();

        if (! $delivery) {
            $event->forceFill([
                'status' => 'unmatched',
                'notes' => 'No notification delivery matched the OneSignal provider reference.',
                'processed_at' => now(),
            ])->save();

            return response()->json(['ok' => true]);
        }

        $normalized = str_contains($eventType, 'fail') || str_contains($eventType, 'error')
            ? 'failed'
            : (str_contains($eventType, 'deliver') ? 'delivered' : 'sent');

        $delivery->forceFill([
            'status' => $normalized,
            'external_status' => $eventType,
            'error_message' => $normalized === 'failed'
                ? (string) ($payload['error'] ?? $payload['message'] ?? $delivery->error_message)
                : $delivery->error_message,
            'last_webhook_at' => now(),
            'failed_at' => $normalized === 'failed' ? now() : null,
            'delivered_at' => $normalized === 'delivered' ? now() : $delivery->delivered_at,
        ])->save();

        $event->forceFill([
            'notification_delivery_id' => $delivery->id,
            'status' => 'processed',
            'processed_at' => now(),
        ])->save();

        return response()->json(['ok' => true]);
    }

    private function ensureSecretMatches(?string $givenSecret, ?string $expectedSecret): void
    {
        abort_if(blank($expectedSecret) || $givenSecret !== $expectedSecret, 403);
    }
}
