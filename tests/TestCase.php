<?php

namespace DevFoxx\AdminPanel\Tests;

use DevFoxx\AdminPanel\AdminPanelServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [
            AdminPanelServiceProvider::class,
        ];
    }

    protected function getEnvironmentSetUp($app): void
    {
        $app['config']->set('database.default', 'testing');
        $app['config']->set('database.connections.testing', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
        ]);

        $app['config']->set('admin-panel.load_routes', true);
        $app['config']->set('admin-panel.admin_prefix', 'package-admin');
        $app['config']->set('admin-panel.public_path', 'package-gallery');
    }
}
