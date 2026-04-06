<?php

return [
    'load_routes' => true,

    'ui_stack' => env('DEVFOXX_ADMIN_PANEL_UI_STACK', 'blade'),

    'inertia_pages' => [
        'public_gallery' => 'Vendor/AdminPanel/Gallery/Index',
        'admin_gallery' => 'Vendor/AdminPanel/Admin/Gallery/Index',
    ],

    'table_name' => env('DEVFOXX_ADMIN_PANEL_TABLE', 'gallery_items'),

    'disk' => env('DEVFOXX_ADMIN_PANEL_DISK', 'public'),

    'permission' => env('DEVFOXX_ADMIN_PANEL_PERMISSION', 'manage galleries'),

    'public_path' => env('DEVFOXX_ADMIN_PANEL_PUBLIC_PATH', 'package-gallery'),

    'admin_prefix' => env('DEVFOXX_ADMIN_PANEL_ADMIN_PREFIX', 'package-admin'),

    'public_middleware' => ['web'],

    'admin_middleware' => ['web', 'auth'],

    'media_directory' => 'gallery/media',

    'thumbnail_directory' => 'gallery/thumbnails',

    'paginate' => 15,

    'views' => [
        'public_gallery' => 'admin-panel::gallery.index',
        'admin_gallery' => 'admin-panel::admin.gallery.index',
    ],
];
