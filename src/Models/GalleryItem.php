<?php

namespace DevFoxx\AdminPanel\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GalleryItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'media_type',
        'media_path',
        'thumbnail_path',
        'alt_text',
        'is_active',
        'is_featured',
        'sort_order',
        'published_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'published_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function getTable(): string
    {
        return (string) config('admin-panel.table_name', 'gallery_items');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where(function (Builder $builder) {
                $builder->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->orderByDesc('published_at')
            ->orderByDesc('created_at');
    }

    public function getMediaUrlAttribute(): ?string
    {
        return $this->resolvePublicUrl($this->media_path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->resolvePublicUrl($this->thumbnail_path);
    }

    protected function resolvePublicUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $disk = (string) config('admin-panel.disk', 'public');
        $baseUrl = (string) config("filesystems.disks.{$disk}.url", '/storage');

        if (str_starts_with($baseUrl, 'http://') || str_starts_with($baseUrl, 'https://')) {
            return rtrim($baseUrl, '/').'/'.ltrim($path, '/');
        }

        return '/'.trim($baseUrl, '/').'/'.ltrim($path, '/');
    }
}
