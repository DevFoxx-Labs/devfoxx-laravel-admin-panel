<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::withCount('blogs')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Blog/Categories', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        Category::create($data);

        return back()->with('flash', ['type' => 'success', 'message' => 'Category created successfully.']);
    }

    public function update(StoreCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        return back()->with('flash', ['type' => 'success', 'message' => 'Category updated successfully.']);
    }

    public function destroy(Category $category): RedirectResponse
    {
        $category->delete();

        return back()->with('flash', ['type' => 'success', 'message' => 'Category deleted.']);
    }
}
