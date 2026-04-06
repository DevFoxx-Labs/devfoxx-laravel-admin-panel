<?php

namespace App\Services\Notifications;

use App\Models\NotificationCampaign;
use App\Models\SiteSetting;
use App\Models\User;

class NotificationTemplateRenderer
{
    public function renderCampaign(NotificationCampaign $campaign, User $user): array
    {
        $context = $this->context($campaign, $user);

        return [
            'subject' => $this->renderString($campaign->subject, $context),
            'message' => $this->renderString($campaign->message, $context),
            'action_url' => $this->renderString($campaign->action_url, $context),
        ];
    }

    public static function availableVariables(): array
    {
        return [
            '{{ user.id }}' => 'Recipient user ID',
            '{{ user.name }}' => 'Recipient full name',
            '{{ user.email }}' => 'Recipient email address',
            '{{ user.phone_number }}' => 'Recipient phone number',
            '{{ user.whatsapp_number }}' => 'Recipient WhatsApp number',
            '{{ campaign.id }}' => 'Campaign ID',
            '{{ campaign.title }}' => 'Campaign title',
            '{{ site.name }}' => 'Configured site name',
            '{{ site.support_email }}' => 'Configured support email',
            '{{ site.url }}' => 'Application base URL',
            '{{ custom.any_key }}' => 'Custom JSON variables supplied when queuing the campaign',
        ];
    }

    private function context(NotificationCampaign $campaign, User $user): array
    {
        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'whatsapp_number' => $user->whatsapp_number,
            ],
            'campaign' => [
                'id' => $campaign->id,
                'title' => $campaign->title,
            ],
            'site' => [
                'name' => SiteSetting::getValue('site_name', config('app.name')),
                'support_email' => SiteSetting::getValue('support_email', config('mail.from.address')),
                'url' => config('app.url'),
            ],
            'custom' => $campaign->custom_variables ?? [],
        ];
    }

    private function renderString(?string $template, array $context): ?string
    {
        if ($template === null) {
            return null;
        }

        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/', function (array $matches) use ($context) {
            $value = data_get($context, $matches[1]);

            if (is_array($value) || is_object($value)) {
                return $matches[0];
            }

            return $value === null ? $matches[0] : (string) $value;
        }, $template) ?? $template;
    }
}
