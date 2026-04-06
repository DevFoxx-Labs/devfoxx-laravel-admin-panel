<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Page extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'path',
        'excerpt',
        'content',
        'status',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'show_in_menu',
        'is_homepage',
        'sort_order',
        'published_at',
    ];

    protected $casts = [
        'show_in_menu' => 'boolean',
        'is_homepage' => 'boolean',
        'sort_order' => 'integer',
        'published_at' => 'datetime',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', 'published')
            ->where(function (Builder $builder) {
                $builder->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }

    public function scopeInMenu(Builder $query): Builder
    {
        return $query
            ->published()
            ->where('show_in_menu', true)
            ->orderBy('sort_order')
            ->orderBy('title');
    }

    public function getPublicPathAttribute(): string
    {
        return $this->is_homepage ? '/' : '/'.$this->path;
    }
}