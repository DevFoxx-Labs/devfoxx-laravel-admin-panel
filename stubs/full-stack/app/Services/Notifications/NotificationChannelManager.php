<?php

namespace App\Services\Notifications;

use App\Models\NotificationCampaign;
use App\Models\User;
use App\Services\Notifications\Channels\EmailChannel;
use App\Services\Notifications\Channels\PushChannel;
use App\Services\Notifications\Channels\SmsChannel;
use App\Services\Notifications\Channels\WhatsAppChannel;
use InvalidArgumentException;

class NotificationChannelManager
{
    public function __construct(
        private readonly EmailChannel $emailChannel,
        private readonly SmsChannel $smsChannel,
        private readonly WhatsAppChannel $whatsAppChannel,
        private readonly PushChannel $pushChannel,
        private readonly NotificationTemplateRenderer $templateRenderer,
    ) {
    }

    public function resolveDestination(string $channel, User $user): ?string
    {
        return $this->driver($channel)->destination($user);
    }

    public function send(string $channel, NotificationCampaign $campaign, User $user): array
    {
        return $this->driver($channel)->send(
            $campaign,
            $user,
            $this->templateRenderer->renderCampaign($campaign, $user),
        );
    }

    private function driver(string $channel): object
    {
        return match ($channel) {
            'email' => $this->emailChannel,
            'sms' => $this->smsChannel,
            'whatsapp' => $this->whatsAppChannel,
            'push' => $this->pushChannel,
            default => throw new InvalidArgumentException("Unsupported notification channel [{$channel}]."),
        };
    }
}