<?php

namespace DevFoxx\AdminPanel;

use DevFoxx\AdminPanel\Console\InstallAdminPanelCommand;
use DevFoxx\AdminPanel\Console\SyncAdminPanelStubsCommand;
use Illuminate\Support\ServiceProvider;

class AdminPanelServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/admin-panel.php', 'admin-panel');
    }

    public function boot(): void
    {
        if (config('admin-panel.load_routes', true)) {
            $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        }

        $this->loadViewsFrom(__DIR__.'/../resources/views', 'admin-panel');
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');

        if (! $this->app->runningInConsole()) {
            return;
        }

        $this->publishes([
            __DIR__.'/../config/admin-panel.php' => config_path('admin-panel.php'),
        ], 'devfoxx-admin-panel-config');

        $this->publishes([
            __DIR__.'/../resources/views' => resource_path('views/vendor/admin-panel'),
        ], 'devfoxx-admin-panel-views');

        $this->publishes([
            __DIR__.'/../database/migrations' => database_path('migrations'),
        ], 'devfoxx-admin-panel-migrations');

        $this->publishes([
            __DIR__.'/../stubs/full-stack/resources/js' => resource_path('js'),
            __DIR__.'/../stubs/full-stack/resources/css' => resource_path('css'),
            __DIR__.'/../stubs/full-stack/resources/views' => resource_path('views'),
            __DIR__.'/../stubs/full-stack/vite.config.js' => base_path('vite.config.js'),
            __DIR__.'/../stubs/full-stack/tailwind.config.js' => base_path('tailwind.config.js'),
            __DIR__.'/../stubs/full-stack/postcss.config.js' => base_path('postcss.config.js'),
            __DIR__.'/../stubs/full-stack/jsconfig.json' => base_path('jsconfig.json'),
        ], 'devfoxx-admin-panel-ui');

        $this->publishes([
            __DIR__.'/../stubs/full-stack/app/Http' => app_path('Http'),
            __DIR__.'/../stubs/full-stack/app/Jobs' => app_path('Jobs'),
            __DIR__.'/../stubs/full-stack/app/Mail' => app_path('Mail'),
            __DIR__.'/../stubs/full-stack/app/Models' => app_path('Models'),
            __DIR__.'/../stubs/full-stack/app/Providers' => app_path('Providers'),
            __DIR__.'/../stubs/full-stack/app/Services' => app_path('Services'),
            __DIR__.'/../stubs/full-stack/config' => config_path(),
            __DIR__.'/../stubs/full-stack/database/migrations' => database_path('migrations'),
            __DIR__.'/../stubs/full-stack/database/seeders' => database_path('seeders'),
            __DIR__.'/../stubs/full-stack/routes' => base_path('routes'),
        ], 'devfoxx-admin-panel-full-stack');

        $this->commands([
            InstallAdminPanelCommand::class,
            SyncAdminPanelStubsCommand::class,
        ]);
    }
}
