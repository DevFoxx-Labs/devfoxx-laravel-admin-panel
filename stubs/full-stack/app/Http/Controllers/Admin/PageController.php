<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageRequest;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Page::query();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('path', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        $pages = $query
            ->orderByDesc('is_homepage')
            ->orderBy('sort_order')
            ->orderByDesc('updated_at')
            ->paginate(12)
            ->through(fn (Page $page) => [
                'id' => $page->id,
                'title' => $page->title,
                'path' => $page->path,
                'public_path' => $page->public_path,
                'excerpt' => $page->excerpt,
                'status' => $page->status,
                'show_in_menu' => $page->show_in_menu,
                'is_homepage' => $page->is_homepage,
                'sort_order' => $page->sort_order,
                'published_at' => optional($page->published_at)?->toIso8601String(),
                'updated_at' => optional($page->updated_at)?->toIso8601String(),
            ])
            ->withQueryString();

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
            'filters' => $request->only(['search', 'status']),
            'stats' => [
                'total' => Page::count(),
                'published' => Page::where('status', 'published')->count(),
                'draft' => Page::where('status', 'draft')->count(),
                'menu' => Page::where('show_in_menu', true)->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Pages/Form', [
            'page' => null,
        ]);
    }

    public function store(StorePageRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        if ($data['is_homepage']) {
            $data['path'] = null;
        }

        Page::create($data);

        return redirect()->route('admin.pages.index')
            ->with('success', 'Page created successfully.');
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('Admin/Pages/Form', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'path' => $page->path,
                'excerpt' => $page->excerpt,
                'content' => $page->content,
                'status' => $page->status,
                'meta_title' => $page->meta_title,
                'meta_description' => $page->meta_description,
                'meta_keywords' => $page->meta_keywords,
                'show_in_menu' => $page->show_in_menu,
                'is_homepage' => $page->is_homepage,
                'sort_order' => $page->sort_order,
                'published_at' => optional($page->published_at)?->toIso8601String(),
            ],
        ]);
    }

    public function update(StorePageRequest $request, Page $page): RedirectResponse
    {
        $data = $request->validated();

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = $page->published_at ?? now();
        }

        if ($data['is_homepage']) {
            $data['path'] = null;
        }

        $page->update($data);

        return redirect()->route('admin.pages.index')
            ->with('success', 'Page updated successfully.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->forceDelete();

        return back()->with('success', 'Page deleted successfully.');
    }
}