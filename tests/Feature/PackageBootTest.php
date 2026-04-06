<?php

namespace DevFoxx\AdminPanel\Tests\Feature;

use DevFoxx\AdminPanel\Tests\TestCase;

class PackageBootTest extends TestCase
{
    public function test_package_routes_are_registered(): void
    {
        $this->assertTrue(app('router')->has('admin-panel.gallery.index'));
        $this->assertTrue(app('router')->has('admin-panel.gallery.public'));

        $this->assertSame('/package-admin/gallery', route('admin-panel.gallery.index', absolute: false));
        $this->assertSame('/package-gallery', route('admin-panel.gallery.public', absolute: false));
    }

    public function test_package_config_is_available(): void
    {
        $this->assertSame('package-admin', config('admin-panel.admin_prefix'));
        $this->assertSame('package-gallery', config('admin-panel.public_path'));
    }
}
