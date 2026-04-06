<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGalleryItemRequest;
use App\Models\GalleryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = GalleryItem::query()->withTrashed();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('alt_text', 'like', "%{$search}%");
            });
        }

        if ($request->filled('media_type')) {
            $query->where('media_type', $request->string('media_type')->toString());
        }

        if ($request->filled('status')) {
            match ($request->string('status')->toString()) {
                'active' => $query->whereNull('deleted_at')->where('is_active', true),
                'inactive' => $query->whereNull('deleted_at')->where('is_active', false),
                'featured' => $query->whereNull('deleted_at')->where('is_featured', true),
                'trashed' => $query->onlyTrashed(),
                default => null,
            };
        } else {
            $query->whereNull('deleted_at');
        }

        $galleryItems = $query
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->paginate(15)
            ->through(fn (GalleryItem $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'description' => $item->description,
                'media_type' => $item->media_type,
                'media_url' => $item->media_url,
                'thumbnail_url' => $item->thumbnail_url,
                'alt_text' => $item->alt_text,
                'is_active' => $item->is_active,
                'is_featured' => $item->is_featured,
                'sort_order' => $item->sort_order,
                'published_at' => optional($item->published_at)?->toIso8601String(),
                'deleted_at' => optional($item->deleted_at)?->toIso8601String(),
                'updated_at' => optional($item->updated_at)?->toIso8601String(),
            ])
            ->withQueryString();

        return Inertia::render('Admin/Gallery/Index', [
            'galleryItems' => $galleryItems,
            'filters' => $request->only(['search', 'status', 'media_type']),
            'stats' => [
                'total' => GalleryItem::count(),
                'active' => GalleryItem::where('is_active', true)->count(),
                'video' => GalleryItem::where('media_type', 'video')->count(),
                'featured' => GalleryItem::where('is_featured', true)->count(),
                'trashed' => GalleryItem::onlyTrashed()->count(),
            ],
        ]);
    }

    public function store(StoreGalleryItemRequest $request): RedirectResponse
    {
        $data = $this->persistPayload($request);

        GalleryItem::create($data);

        return back()->with('success', 'Gallery item created successfully.');
    }

    public function update(StoreGalleryItemRequest $request, GalleryItem $gallery): RedirectResponse
    {
        $data = $this->persistPayload($request, $gallery);

        $gallery->update($data);

        return back()->with('success', 'Gallery item updated successfully.');
    }

    public function destroy(GalleryItem $gallery): RedirectResponse
    {
        $gallery->delete();

        return back()->with('success', 'Gallery item moved to trash.');
    }

    public function restore(int $id): RedirectResponse
    {
        $gallery = GalleryItem::withTrashed()->findOrFail($id);
        $gallery->restore();

        return back()->with('success', 'Gallery item restored successfully.');
    }

    public function forceDelete(int $id): RedirectResponse
    {
        $gallery = GalleryItem::withTrashed()->findOrFail($id);
        $this->deleteStoredMedia($gallery);
        $gallery->forceDelete();

        return back()->with('success', 'Gallery item permanently deleted.');
    }

    public function toggleFeatured(GalleryItem $gallery): RedirectResponse
    {
        $gallery->update(['is_featured' => ! $gallery->is_featured]);

        return back()->with('success', 'Featured status updated.');
    }

    public function toggleActive(GalleryItem $gallery): RedirectResponse
    {
        $gallery->update(['is_active' => ! $gallery->is_active]);

        return back()->with('success', 'Active status updated.');
    }

    private function persistPayload(StoreGalleryItemRequest $request, ?GalleryItem $gallery = null): array
    {
        $data = $request->safe()->except(['media_file', 'thumbnail_file']);

        if ($request->hasFile('media_file')) {
            if ($gallery?->media_path) {
                Storage::disk('public')->delete($gallery->media_path);
            }

            $data['media_path'] = $request->file('media_file')->store('gallery/media', 'public');
        } elseif ($gallery) {
            $data['media_path'] = $gallery->media_path;
        }

        if ($request->hasFile('thumbnail_file')) {
            if ($gallery?->thumbnail_path) {
                Storage::disk('public')->delete($gallery->thumbnail_path);
            }

            $data['thumbnail_path'] = $request->file('thumbnail_file')->store('gallery/thumbnails', 'public');
        } elseif ($gallery) {
            $data['thumbnail_path'] = $gallery->thumbnail_path;
        }

        if (($data['media_type'] ?? $gallery?->media_type) === 'image' && ! $request->hasFile('thumbnail_file')) {
            $data['thumbnail_path'] = $gallery?->thumbnail_path;
        }

        if (($data['is_active'] ?? false) && empty($data['published_at'])) {
            $data['published_at'] = $gallery?->published_at ?? now();
        }

        return $data;
    }

    private function deleteStoredMedia(GalleryItem $gallery): void
    {
        if ($gallery->media_path) {
            Storage::disk('public')->delete($gallery->media_path);
        }

        if ($gallery->thumbnail_path) {
            Storage::disk('public')->delete($gallery->thumbnail_path);
        }
    }
}
