<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PushDeviceController;
use App\Http\Controllers\Admin\AccessControlController;
use App\Http\Controllers\Admin\BlogController as AdminBlogController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PageController as AdminPageController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\TestimonialController as PublicTestimonialController;
use App\Http\Controllers\Webhook\NotificationWebhookController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [PageController::class, 'home'])->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'permission:view dashboard'])->name('dashboard');

Route::get('/admin', function () {
    return Inertia::render('Admin/Index');
})->middleware(['auth', 'verified', 'role:admin'])->name('admin.index');

Route::middleware(['auth', 'verified', 'permission:manage site settings|manage seo settings'])->group(function () {
    Route::get('/admin/settings', [SiteSettingController::class, 'index'])->name('admin.settings.index');
    Route::put('/admin/settings', [SiteSettingController::class, 'update'])->name('admin.settings.update');
});

Route::middleware(['auth', 'verified', 'permission:manage roles|manage users'])->group(function () {
    Route::get('/admin/access-control', [AccessControlController::class, 'index'])->name('admin.access-control.index');
});

Route::middleware(['auth', 'verified', 'permission:manage roles'])->group(function () {
    Route::post('/admin/access-control/roles', [AccessControlController::class, 'storeRole'])->name('admin.access-control.roles.store');
    Route::put('/admin/access-control/roles/{role}', [AccessControlController::class, 'updateRole'])->name('admin.access-control.roles.update');
});

Route::middleware(['auth', 'verified', 'permission:manage notifications'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications', [NotificationController::class, 'store'])->name('notifications.store');
    Route::post('/notifications/templates', [NotificationController::class, 'storeTemplate'])->name('notifications.templates.store');
    Route::put('/notifications/templates/{notificationTemplate}', [NotificationController::class, 'updateTemplate'])->name('notifications.templates.update');
    Route::delete('/notifications/templates/{notificationTemplate}', [NotificationController::class, 'destroyTemplate'])->name('notifications.templates.destroy');
    Route::get('/notifications/users/search', [NotificationController::class, 'searchUsers'])->name('notifications.users.search');
    Route::post('/notifications/{notificationCampaign}/cancel', [NotificationController::class, 'cancel'])->name('notifications.cancel');
    Route::post('/notifications/{notificationCampaign}/retry-failures', [NotificationController::class, 'retryCampaignFailures'])->name('notifications.retry-failures');
    Route::post('/notification-deliveries/{notificationDelivery}/retry', [NotificationController::class, 'retryDelivery'])->name('notification-deliveries.retry');
});

Route::middleware(['auth', 'verified', 'permission:manage pages'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/pages', [AdminPageController::class, 'index'])->name('pages.index');
    Route::get('/pages/create', [AdminPageController::class, 'create'])->name('pages.create');
    Route::post('/pages', [AdminPageController::class, 'store'])->name('pages.store');
    Route::get('/pages/{page}/edit', [AdminPageController::class, 'edit'])->name('pages.edit');
    Route::put('/pages/{page}', [AdminPageController::class, 'update'])->name('pages.update');
    Route::delete('/pages/{page}', [AdminPageController::class, 'destroy'])->name('pages.destroy');
});

Route::middleware(['auth', 'verified', 'permission:manage users'])->group(function () {
    Route::put('/admin/access-control/users/{user}/roles', [AccessControlController::class, 'updateUserRoles'])->name('admin.access-control.users.roles.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/push-devices', [PushDeviceController::class, 'store'])->name('push-devices.store');
    Route::delete('/push-devices/{device}', [PushDeviceController::class, 'destroy'])->name('push-devices.destroy');
});

// ─── Public Blog Routes ────────────────────────────────────────────────────────
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery.index');

Route::middleware('auth')->group(function () {
    Route::post('/blog/{blog}/comments', [BlogController::class, 'storeComment'])->name('blog.comments.store');
    Route::delete('/blog/{blog}/comments/{comment}', [BlogController::class, 'destroyComment'])->name('blog.comments.destroy');
});

// ─── Admin Blog & Category Routes ─────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'permission:manage blogs'])->prefix('admin')->name('admin.')->group(function () {
    // Categories
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Blogs
    Route::get('/blogs', [AdminBlogController::class, 'index'])->name('blogs.index');
    Route::get('/blogs/create', [AdminBlogController::class, 'create'])->name('blogs.create');
    Route::post('/blogs', [AdminBlogController::class, 'store'])->name('blogs.store');
    Route::get('/blogs/{blog}/edit', [AdminBlogController::class, 'edit'])->name('blogs.edit');
    Route::put('/blogs/{blog}', [AdminBlogController::class, 'update'])->name('blogs.update');
    Route::delete('/blogs/{blog}', [AdminBlogController::class, 'destroy'])->name('blogs.destroy');

    // Blog comments management
    Route::get('/blogs/{blog}/comments', [AdminBlogController::class, 'comments'])->name('blogs.comments.index');
    Route::patch('/blogs/{blog}/comments/{comment}/toggle', [AdminBlogController::class, 'toggleComment'])->name('blogs.comments.toggle');
    Route::delete('/blogs/{blog}/comments/{comment}', [AdminBlogController::class, 'destroyComment'])->name('blogs.comments.destroy');
});

// ─── Admin Testimonial Routes ──────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'permission:manage testimonials'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/testimonials', [TestimonialController::class, 'index'])->name('testimonials.index');
    Route::post('/testimonials', [TestimonialController::class, 'store'])->name('testimonials.store');
    Route::put('/testimonials/{testimonial}', [TestimonialController::class, 'update'])->name('testimonials.update');
    Route::delete('/testimonials/{testimonial}', [TestimonialController::class, 'destroy'])->name('testimonials.destroy');
    Route::patch('/testimonials/{id}/restore', [TestimonialController::class, 'restore'])->name('testimonials.restore');
    Route::delete('/testimonials/{id}/force-delete', [TestimonialController::class, 'forceDelete'])->name('testimonials.force-delete');
    Route::patch('/testimonials/{testimonial}/toggle-featured', [TestimonialController::class, 'toggleFeatured'])->name('testimonials.toggle-featured');
    Route::patch('/testimonials/{testimonial}/toggle-active', [TestimonialController::class, 'toggleActive'])->name('testimonials.toggle-active');
    Route::post('/testimonials/reorder', [TestimonialController::class, 'reorder'])->name('testimonials.reorder');
});

Route::middleware(['auth', 'verified', 'permission:manage galleries'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/gallery', [AdminGalleryController::class, 'index'])->name('gallery.index');
    Route::post('/gallery', [AdminGalleryController::class, 'store'])->name('gallery.store');
    Route::put('/gallery/{gallery}', [AdminGalleryController::class, 'update'])->name('gallery.update');
    Route::delete('/gallery/{gallery}', [AdminGalleryController::class, 'destroy'])->name('gallery.destroy');
    Route::patch('/gallery/{id}/restore', [AdminGalleryController::class, 'restore'])->name('gallery.restore');
    Route::delete('/gallery/{id}/force-delete', [AdminGalleryController::class, 'forceDelete'])->name('gallery.force-delete');
    Route::patch('/gallery/{gallery}/toggle-featured', [AdminGalleryController::class, 'toggleFeatured'])->name('gallery.toggle-featured');
    Route::patch('/gallery/{gallery}/toggle-active', [AdminGalleryController::class, 'toggleActive'])->name('gallery.toggle-active');
});

// ─── Public Testimonials Route ─────────────────────────────────────────────────
Route::get('/testimonials', [PublicTestimonialController::class, 'index'])->name('testimonials.index');

Route::post('/webhooks/notifications/twilio', [NotificationWebhookController::class, 'twilio'])->name('webhooks.notifications.twilio');
Route::post('/webhooks/notifications/onesignal', [NotificationWebhookController::class, 'oneSignal'])->name('webhooks.notifications.onesignal');

require __DIR__.'/auth.php';

Route::get('/{path}', [PageController::class, 'show'])
    ->where('path', '.*')
    ->name('pages.show');
