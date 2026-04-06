<?php

namespace App\Services\Notifications\Channels;

use App\Mail\AdminNotificationCampaignMail;
use App\Models\NotificationCampaign;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class EmailChannel
{
    public function destination(User $user): ?string
    {
        return $user->email ?: null;
    }

    public function send(NotificationCampaign $campaign, User $user, array $content): array
    {
        if (! $user->email) {
            return [
                'status' => 'skipped',
                'provider' => config('mail.default'),
                'provider_reference' => null,
                'external_status' => 'missing_destination',
                'error_message' => 'User does not have an email address.',
                'payload' => null,
            ];
        }

        Mail::to($user->email)->send(new AdminNotificationCampaignMail($campaign, $user, $content));

        return [
            'status' => 'sent',
            'provider' => config('mail.default'),
            'provider_reference' => 'mail',
            'external_status' => 'submitted',
            'error_message' => null,
            'payload' => ['driver' => config('mail.default')],
        ];
    }
}