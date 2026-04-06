<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function home(): Response
    {
        $page = Page::query()
            ->published()
            ->where('is_homepage', true)
            ->first();

        if (! $page) {
            return Inertia::render('Welcome', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        }

        return $this->renderPage($page);
    }

    public function show(string $path): Response
    {
        $page = Page::query()
            ->published()
            ->where('path', trim($path, '/'))
            ->firstOrFail();

        return $this->renderPage($page);
    }

    private function renderPage(Page $page): Response
    {
        $menuPages = Page::query()
            ->inMenu()
            ->get(['id', 'title', 'path', 'is_homepage'])
            ->map(fn (Page $menuPage) => [
                'id' => $menuPage->id,
                'title' => $menuPage->title,
                'path' => $menuPage->path,
                'public_path' => $menuPage->public_path,
                'is_homepage' => $menuPage->is_homepage,
            ]);

        return Inertia::render('Page/Show', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'excerpt' => $page->excerpt,
                'content' => $page->content,
                'path' => $page->path,
                'public_path' => $page->public_path,
                'meta_title' => $page->meta_title,
                'meta_description' => $page->meta_description,
                'meta_keywords' => $page->meta_keywords,
                'show_in_menu' => $page->show_in_menu,
            ],
            'menuPages' => $menuPages,
        ]);
    }
}