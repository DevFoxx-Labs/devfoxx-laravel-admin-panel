<?php

use DevFoxx\AdminPanel\Http\Controllers\Admin\GalleryController as AdminGalleryController;
use DevFoxx\AdminPanel\Http\Controllers\GalleryController;
use Illuminate\Support\Facades\Route;

if (config('admin-panel.load_routes', true)) {
    if (config('admin-panel.public_path')) {
        Route::middleware(config('admin-panel.public_middleware', ['web']))
            ->get('/'.trim((string) config('admin-panel.public_path', 'package-gallery'), '/'), [GalleryController::class, 'index'])
            ->name('admin-panel.gallery.public');
    }

    Route::middleware(config('admin-panel.admin_middleware', ['web', 'auth']))
        ->prefix(trim((string) config('admin-panel.admin_prefix', 'package-admin'), '/'))
        ->name('admin-panel.gallery.')
        ->group(function () {
            Route::get('/gallery', [AdminGalleryController::class, 'index'])->name('index');
            Route::post('/gallery', [AdminGalleryController::class, 'store'])->name('store');
            Route::put('/gallery/{gallery}', [AdminGalleryController::class, 'update'])->name('update');
            Route::delete('/gallery/{gallery}', [AdminGalleryController::class, 'destroy'])->name('destroy');
            Route::patch('/gallery/{id}/restore', [AdminGalleryController::class, 'restore'])->name('restore');
            Route::delete('/gallery/{id}/force-delete', [AdminGalleryController::class, 'forceDelete'])->name('force-delete');
            Route::patch('/gallery/{gallery}/toggle-featured', [AdminGalleryController::class, 'toggleFeatured'])->name('toggle-featured');
            Route::patch('/gallery/{gallery}/toggle-active', [AdminGalleryController::class, 'toggleActive'])->name('toggle-active');
        });
}
