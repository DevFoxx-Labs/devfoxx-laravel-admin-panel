<?php

namespace DevFoxx\AdminPanel\Http\Controllers\Admin;

use DevFoxx\AdminPanel\Http\Requests\StoreGalleryItemRequest;
use DevFoxx\AdminPanel\Models\GalleryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class GalleryController
{
    public function index(Request $request): View|JsonResponse|InertiaResponse
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
            ->ordered()
            ->paginate((int) config('admin-panel.paginate', 15))
            ->withQueryString();

        $editing = $request->filled('edit')
            ? GalleryItem::withTrashed()->find($request->integer('edit'))
            : null;

        $stats = [
            'total' => GalleryItem::count(),
            'active' => GalleryItem::where('is_active', true)->count(),
            'video' => GalleryItem::where('media_type', 'video')->count(),
            'featured' => GalleryItem::where('is_featured', true)->count(),
            'trashed' => GalleryItem::onlyTrashed()->count(),
        ];

        $payload = [
            'galleryItems' => $galleryItems,
            'filters' => $request->only(['search', 'status', 'media_type']),
            'stats' => $stats,
            'editing' => $editing,
        ];

        if ($request->wantsJson()) {
            return response()->json($payload);
        }

        if (config('admin-panel.ui_stack') === 'inertia' && class_exists(Inertia::class)) {
            return Inertia::render((string) config('admin-panel.inertia_pages.admin_gallery', 'Vendor/AdminPanel/Admin/Gallery/Index'), [
                'galleryItems' => $galleryItems->through(fn (GalleryItem $item) => [
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
                ]),
                'filters' => $request->only(['search', 'status', 'media_type']),
                'stats' => $stats,
            ]);
        }

        return view(config('admin-panel.views.admin_gallery', 'admin-panel::admin.gallery.index'), $payload);
    }

    public function store(StoreGalleryItemRequest $request): RedirectResponse
    {
        GalleryItem::create($this->persistPayload($request));

        return back()->with('success', 'Gallery item created successfully.');
    }

    public function update(StoreGalleryItemRequest $request, GalleryItem $gallery): RedirectResponse
    {
        $gallery->update($this->persistPayload($request, $gallery));

        return redirect()->route('admin-panel.gallery.index')->with('success', 'Gallery item updated successfully.');
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
        $disk = (string) config('admin-panel.disk', 'public');

        if ($request->hasFile('media_file')) {
            if ($gallery?->media_path) {
                Storage::disk($disk)->delete($gallery->media_path);
            }

            $data['media_path'] = $request->file('media_file')->store((string) config('admin-panel.media_directory', 'gallery/media'), $disk);
        } elseif ($gallery) {
            $data['media_path'] = $gallery->media_path;
        }

        if ($request->hasFile('thumbnail_file')) {
            if ($gallery?->thumbnail_path) {
                Storage::disk($disk)->delete($gallery->thumbnail_path);
            }

            $data['thumbnail_path'] = $request->file('thumbnail_file')->store((string) config('admin-panel.thumbnail_directory', 'gallery/thumbnails'), $disk);
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
        $disk = (string) config('admin-panel.disk', 'public');

        if ($gallery->media_path) {
            Storage::disk($disk)->delete($gallery->media_path);
        }

        if ($gallery->thumbnail_path) {
            Storage::disk($disk)->delete($gallery->thumbnail_path);
        }
    }
}
