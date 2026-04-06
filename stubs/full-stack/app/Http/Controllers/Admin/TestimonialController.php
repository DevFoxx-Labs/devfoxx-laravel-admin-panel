<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTestimonialRequest;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $query = Testimonial::withTrashed();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            match ($request->status) {
                'active'   => $query->whereNull('deleted_at')->where('is_active', true),
                'inactive' => $query->whereNull('deleted_at')->where('is_active', false),
                'featured' => $query->whereNull('deleted_at')->where('is_featured', true),
                'trashed'  => $query->onlyTrashed(),
                default    => null,
            };
        } else {
            $query->whereNull('deleted_at');
        }

        $testimonials = $query
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Admin/Testimonials/Index', [
            'testimonials' => $testimonials,
            'filters'      => $request->only(['search', 'status']),
            'stats'        => [
                'total'    => Testimonial::count(),
                'active'   => Testimonial::where('is_active', true)->count(),
                'featured' => Testimonial::where('is_featured', true)->count(),
                'trashed'  => Testimonial::onlyTrashed()->count(),
            ],
        ]);
    }

    public function store(StoreTestimonialRequest $request)
    {
        Testimonial::create($request->validated());

        return back()->with('success', 'Testimonial created successfully.');
    }

    public function update(StoreTestimonialRequest $request, Testimonial $testimonial)
    {
        $testimonial->update($request->validated());

        return back()->with('success', 'Testimonial updated successfully.');
    }

    public function destroy(Testimonial $testimonial)
    {
        $this->authorize('manage testimonials');
        $testimonial->delete();

        return back()->with('success', 'Testimonial moved to trash.');
    }

    public function restore(int $id)
    {
        $this->authorize('manage testimonials');
        $testimonial = Testimonial::withTrashed()->findOrFail($id);
        $testimonial->restore();

        return back()->with('success', 'Testimonial restored successfully.');
    }

    public function forceDelete(int $id)
    {
        $this->authorize('manage testimonials');
        $testimonial = Testimonial::withTrashed()->findOrFail($id);
        $testimonial->forceDelete();

        return back()->with('success', 'Testimonial permanently deleted.');
    }

    public function toggleFeatured(Testimonial $testimonial)
    {
        $this->authorize('manage testimonials');
        $testimonial->update(['is_featured' => ! $testimonial->is_featured]);

        return back()->with('success', 'Featured status updated.');
    }

    public function toggleActive(Testimonial $testimonial)
    {
        $this->authorize('manage testimonials');
        $testimonial->update(['is_active' => ! $testimonial->is_active]);

        return back()->with('success', 'Active status updated.');
    }

    public function reorder(Request $request)
    {
        $this->authorize('manage testimonials');
        $request->validate(['order' => ['required', 'array']]);

        foreach ($request->order as $position => $id) {
            Testimonial::where('id', $id)->update(['sort_order' => $position]);
        }

        return back()->with('success', 'Order saved.');
    }
}
