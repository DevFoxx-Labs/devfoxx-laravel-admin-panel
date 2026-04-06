<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationDelivery extends Model
{
    protected $fillable = [
        'notification_campaign_id',
        'user_id',
        'channel',
        'destination',
        'status',
        'provider',
        'provider_reference',
        'external_status',
        'error_message',
        'payload',
        'attempt_count',
        'last_attempted_at',
        'sent_at',
        'delivered_at',
        'failed_at',
        'last_webhook_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'last_attempted_at' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'failed_at' => 'datetime',
        'last_webhook_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(NotificationCampaign::class, 'notification_campaign_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function webhookEvents(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(NotificationWebhookEvent::class, 'notification_delivery_id');
    }
}