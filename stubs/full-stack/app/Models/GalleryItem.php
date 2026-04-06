<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;
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
    ];

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
        return $query->orderByDesc('is_featured')->orderBy('sort_order')->orderByDesc('published_at')->orderByDesc('created_at');
    }

    public function getMediaUrlAttribute(): string
    {
        return $this->resolvePublicUrl($this->media_path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if (! $this->thumbnail_path) {
            return null;
        }

        return $this->resolvePublicUrl($this->thumbnail_path);
    }

    protected function resolvePublicUrl(string $path): string
    {
        $storagePath = '/storage/'.ltrim($path, '/');
        $request = request();

        if ($request instanceof Request) {
            return $request->getSchemeAndHttpHost().$storagePath;
        }

        return $storagePath;
    }
}
