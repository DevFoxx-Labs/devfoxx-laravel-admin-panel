<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Blog;
use App\Models\Category;
use App\Models\Comment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        $blogs = Blog::with(['author:id,name', 'categories:id,name,color'])
            ->withCount(['comments' => fn ($q) => $q->where('is_approved', true)])
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->paginate(9)
            ->withQueryString();

        $categories = Category::withCount(['blogs' => fn ($q) => $q->where('status', 'published')])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Blog/Index', [
            'blogs'      => $blogs,
            'categories' => $categories,
        ]);
    }

    public function show(string $slug): Response
    {
        $blog = Blog::with(['author:id,name', 'categories:id,name,color'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $blog->increment('views_count');

        $comments = $blog->approvedComments()
            ->with([
                'author:id,name',
                'replies' => fn ($q) => $q->where('is_approved', true)->with('author:id,name', 'replies.author:id,name'),
            ])
            ->orderByDesc('created_at')
            ->get();

        $related = Blog::with(['author:id,name', 'categories:id,name,color'])
            ->where('status', 'published')
            ->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $blog->categories->pluck('id')))
            ->where('id', '!=', $blog->id)
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        return Inertia::render('Blog/Show', [
            'blog'     => $blog,
            'comments' => $comments,
            'related'  => $related,
        ]);
    }

    public function storeComment(StoreCommentRequest $request, Blog $blog): RedirectResponse
    {
        $blog->comments()->create([
            'user_id'   => $request->user()->id,
            'parent_id' => $request->validated('parent_id'),
            'body'      => $request->validated('body'),
        ]);

        return back()->with('flash', ['type' => 'success', 'message' => 'Comment posted successfully.']);
    }

    public function destroyComment(Blog $blog, Comment $comment): RedirectResponse
    {
        abort_unless(
            $comment->user_id === request()->user()->id || request()->user()->hasRole('admin'),
            403
        );

        $comment->delete();

        return back()->with('flash', ['type' => 'success', 'message' => 'Comment deleted.']);
    }
}
