<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotificationCampaign extends Model
{
    protected $fillable = [
        'title',
        'subject',
        'message',
        'action_url',
        'notification_template_id',
        'channels',
        'audience_type',
        'audience_filters',
        'custom_variables',
        'status',
        'created_by',
        'total_recipients',
        'processed_recipients',
        'sent_recipients',
        'failed_recipients',
        'skipped_recipients',
        'scheduled_at',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'channels' => 'array',
        'audience_filters' => 'array',
        'custom_variables' => 'array',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(NotificationTemplate::class, 'notification_template_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(NotificationDelivery::class);
    }

    public function targetedUsersQuery(): Builder
    {
        $query = User::query();
        $filters = $this->audience_filters ?? [];

        return match ($this->audience_type) {
            'roles' => $query->whereHas('roles', function (Builder $builder) use ($filters) {
                $builder->whereIn('name', $filters['role_names'] ?? []);
            }),
            'users' => $query->whereIn('id', $filters['user_ids'] ?? []),
            default => $query,
        };
    }
}