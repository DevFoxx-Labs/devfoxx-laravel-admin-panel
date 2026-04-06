<?php

namespace App\Http\Controllers;

use App\Models\GalleryItem;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(): Response
    {
        $items = GalleryItem::query()
            ->published()
            ->ordered()
            ->get()
            ->map(fn (GalleryItem $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'media_type' => $item->media_type,
                'media_url' => $item->media_url,
                'thumbnail_url' => $item->thumbnail_url,
                'alt_text' => $item->alt_text,
                'is_featured' => $item->is_featured,
            ]);

        return Inertia::render('Gallery/Index', [
            'galleryItems' => $items,
            'stats' => [
                'total' => $items->count(),
                'images' => $items->where('media_type', 'image')->count(),
                'videos' => $items->where('media_type', 'video')->count(),
            ],
        ]);
    }
}
