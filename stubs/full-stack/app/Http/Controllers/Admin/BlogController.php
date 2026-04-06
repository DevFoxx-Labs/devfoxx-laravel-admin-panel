<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogRequest;
use App\Models\Blog;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        $blogs = Blog::with(['author:id,name', 'categories:id,name,color'])
            ->withCount('comments')
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        $categories = Category::where('is_active', true)->select('id', 'name')->get();

        return Inertia::render('Admin/Blog/Index', [
            'blogs'      => $blogs,
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        $categories = Category::where('is_active', true)->select('id', 'name', 'color')->get();

        return Inertia::render('Admin/Blog/Form', [
            'blog'       => null,
            'categories' => $categories,
        ]);
    }

    public function store(StoreBlogRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id']  = $request->user()->id;
        $data['slug']     = Str::slug($data['slug'] ?? $data['title']);

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $categoryIds = $data['categories'];
        unset($data['categories']);

        $blog = Blog::create($data);
        $blog->categories()->sync($categoryIds);

        return redirect()->route('admin.blogs.index')
            ->with('flash', ['type' => 'success', 'message' => 'Blog post created successfully.']);
    }

    public function edit(Blog $blog): Response
    {
        $blog->load('categories:id,name,color');
        $categories = Category::where('is_active', true)->select('id', 'name', 'color')->get();

        return Inertia::render('Admin/Blog/Form', [
            'blog'       => $blog,
            'categories' => $categories,
        ]);
    }

    public function update(StoreBlogRequest $request, Blog $blog): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['slug'] ?? $data['title']);

        if ($data['status'] === 'published' && ! $blog->published_at) {
            $data['published_at'] = now();
        }

        $categoryIds = $data['categories'];
        unset($data['categories']);

        $blog->update($data);
        $blog->categories()->sync($categoryIds);

        return redirect()->route('admin.blogs.index')
            ->with('flash', ['type' => 'success', 'message' => 'Blog post updated successfully.']);
    }

    public function destroy(Blog $blog): RedirectResponse
    {
        $blog->delete();

        return back()->with('flash', ['type' => 'success', 'message' => 'Blog post deleted.']);
    }

    public function comments(Blog $blog): Response
    {
        $comments = $blog->comments()
            ->with(['author:id,name,email', 'replies.author:id,name,email'])
            ->whereNull('parent_id')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Admin/Blog/Comments', [
            'blog'     => $blog->only('id', 'title', 'slug'),
            'comments' => $comments,
        ]);
    }

    public function toggleComment(Blog $blog, \App\Models\Comment $comment): RedirectResponse
    {
        $comment->update(['is_approved' => ! $comment->is_approved]);

        return back()->with('flash', ['type' => 'success', 'message' => 'Comment status updated.']);
    }

    public function destroyComment(Blog $blog, \App\Models\Comment $comment): RedirectResponse
    {
        $comment->delete();

        return back()->with('flash', ['type' => 'success', 'message' => 'Comment deleted.']);
    }
}
