<?php

namespace DevFoxx\AdminPanel\Console;

use Illuminate\Console\Command;

class InstallAdminPanelCommand extends Command
{
    protected $signature = 'devfoxx-admin-panel:install
                            {--with-migrations : Publish the package migrations into the host application}
                            {--with-ui : Publish the current React/Inertia UI and frontend config}
                            {--full-stack : Publish the full app scaffolding (app, routes, resources, config, migrations)}
                            {--force : Overwrite existing files during publish}';

    protected $description = 'Publish the DevFoxx Admin Panel configuration, views, UI, and optional full-stack scaffolding.';

    public function handle(): int
    {
        $force = (bool) $this->option('force');

        $this->call('vendor:publish', [
            '--tag' => 'devfoxx-admin-panel-config',
            '--force' => $force,
        ]);

        $this->call('vendor:publish', [
            '--tag' => 'devfoxx-admin-panel-views',
            '--force' => $force,
        ]);

        if ($this->option('with-migrations') || $this->option('full-stack')) {
            $this->call('vendor:publish', [
                '--tag' => 'devfoxx-admin-panel-migrations',
                '--force' => $force,
            ]);
        }

        if ($this->option('with-ui') || $this->option('full-stack')) {
            $this->call('vendor:publish', [
                '--tag' => 'devfoxx-admin-panel-ui',
                '--force' => $force,
            ]);
        }

        if ($this->option('full-stack')) {
            $this->call('vendor:publish', [
                '--tag' => 'devfoxx-admin-panel-full-stack',
                '--force' => $force,
            ]);
        }

        $permissionName = (string) config('admin-panel.permission', '');

        if ($permissionName !== '' && class_exists('Spatie\\Permission\\Models\\Permission')) {
            $permissionModel = 'Spatie\\Permission\\Models\\Permission';
            $permissionModel::findOrCreate($permissionName);

            if (class_exists('Spatie\\Permission\\PermissionRegistrar')) {
                app('Spatie\\Permission\\PermissionRegistrar')->forgetCachedPermissions();
            }

            $this->components->info("Permission [{$permissionName}] is ready.");
        }

        $this->newLine();
        $this->components->info('DevFoxx Admin Panel package installed.');
        $this->line('Next steps:');
        $this->line('  1. php artisan migrate');
        $this->line('  2. php artisan storage:link');

        if ($this->option('with-ui') || $this->option('full-stack')) {
            $this->line('  3. npm install');
            $this->line('  4. npm install @inertiajs/react @headlessui/react antd @ant-design/icons axios react react-dom');
            $this->line('  5. npm run build');
        }

        $this->line('  6. Visit /'.trim((string) config('admin-panel.public_path', 'package-gallery'), '/'));
        $this->line('  7. Visit /'.trim((string) config('admin-panel.admin_prefix', 'package-admin'), '/').'/gallery');

        if ($this->option('full-stack')) {
            $this->warn('Full-stack mode publishes the current app structure and is best used on a fresh Laravel application.');
        }

        return self::SUCCESS;
    }
}
