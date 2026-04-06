<?php

namespace DevFoxx\AdminPanel\Http\Controllers;

use DevFoxx\AdminPanel\Models\GalleryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class GalleryController
{
    public function index(): View|JsonResponse|InertiaResponse
    {
        $items = GalleryItem::query()
            ->published()
            ->ordered()
            ->get();

        $stats = [
            'total' => $items->count(),
            'images' => $items->where('media_type', 'image')->count(),
            'videos' => $items->where('media_type', 'video')->count(),
        ];

        if (request()->wantsJson()) {
            return response()->json([
                'data' => $items,
                'stats' => $stats,
            ]);
        }

        if (config('admin-panel.ui_stack') === 'inertia' && class_exists(Inertia::class)) {
            return Inertia::render((string) config('admin-panel.inertia_pages.public_gallery', 'Vendor/AdminPanel/Gallery/Index'), [
                'galleryItems' => $items->map(fn (GalleryItem $item) => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'description' => $item->description,
                    'media_type' => $item->media_type,
                    'media_url' => $item->media_url,
                    'thumbnail_url' => $item->thumbnail_url,
                    'alt_text' => $item->alt_text,
                    'is_featured' => $item->is_featured,
                ]),
                'stats' => $stats,
            ]);
        }

        return view(config('admin-panel.views.public_gallery', 'admin-panel::gallery.index'), [
            'galleryItems' => $items,
            'stats' => $stats,
        ]);
    }
}
