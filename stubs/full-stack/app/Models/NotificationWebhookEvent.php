<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationWebhookEvent extends Model
{
    protected $fillable = [
        'provider',
        'event_type',
        'provider_reference',
        'notification_delivery_id',
        'headers',
        'payload',
        'status',
        'notes',
        'processed_at',
    ];

    protected $casts = [
        'headers' => 'array',
        'payload' => 'array',
        'processed_at' => 'datetime',
    ];

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(NotificationDelivery::class, 'notification_delivery_id');
    }
}
