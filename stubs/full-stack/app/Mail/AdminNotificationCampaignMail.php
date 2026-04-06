<?php

namespace App\Mail;

use App\Models\NotificationCampaign;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminNotificationCampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public NotificationCampaign $campaign,
        public User $user,
        public array $content,
    ) {
    }

    public function build(): self
    {
        return $this
            ->subject($this->content['subject'] ?: $this->campaign->title)
            ->view('emails.admin-notification-campaign');
    }
}