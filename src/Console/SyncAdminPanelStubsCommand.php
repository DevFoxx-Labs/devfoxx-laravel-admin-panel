<?php

namespace DevFoxx\AdminPanel\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class SyncAdminPanelStubsCommand extends Command
{
    protected $signature = 'devfoxx-admin-panel:sync-stubs
                            {--clean : Remove existing full-stack stubs before syncing}';

    protected $description = 'Sync the current application structure and UI into the package stubs for the next release.';

    public function handle(): int
    {
        $packageRoot = dirname(__DIR__, 2);
        $stubRoot = $packageRoot.'/stubs/full-stack';

        if ($this->option('clean') && File::exists($stubRoot)) {
            File::deleteDirectory($stubRoot);
        }

        File::ensureDirectoryExists($stubRoot);

        $directories = [
            app_path('Http') => $stubRoot.'/app/Http',
            app_path('Jobs') => $stubRoot.'/app/Jobs',
            app_path('Mail') => $stubRoot.'/app/Mail',
            app_path('Models') => $stubRoot.'/app/Models',
            app_path('Providers') => $stubRoot.'/app/Providers',
            app_path('Services') => $stubRoot.'/app/Services',
            base_path('config') => $stubRoot.'/config',
            database_path('migrations') => $stubRoot.'/database/migrations',
            database_path('seeders') => $stubRoot.'/database/seeders',
            resource_path('css') => $stubRoot.'/resources/css',
            resource_path('js') => $stubRoot.'/resources/js',
            resource_path('views') => $stubRoot.'/resources/views',
            base_path('routes') => $stubRoot.'/routes',
        ];

        $files = [
            base_path('vite.config.js') => $stubRoot.'/vite.config.js',
            base_path('tailwind.config.js') => $stubRoot.'/tailwind.config.js',
            base_path('postcss.config.js') => $stubRoot.'/postcss.config.js',
            base_path('jsconfig.json') => $stubRoot.'/jsconfig.json',
        ];

        foreach ($directories as $source => $target) {
            if (! File::exists($source)) {
                $this->components->warn("Skipped missing directory: [{$source}]");
                continue;
            }

            if (File::exists($target)) {
                File::deleteDirectory($target);
            }

            File::ensureDirectoryExists(dirname($target));
            File::copyDirectory($source, $target);
            $this->line("Synced directory: [{$source}] -> [{$target}]");
        }

        foreach ($files as $source => $target) {
            if (! File::exists($source)) {
                $this->components->warn("Skipped missing file: [{$source}]");
                continue;
            }

            File::ensureDirectoryExists(dirname($target));
            File::copy($source, $target);
            $this->line("Synced file: [{$source}] -> [{$target}]");
        }

        $this->newLine();
        $this->components->info('Package stubs synced successfully.');
        $this->line('Next steps:');
        $this->line('  1. Review the diff under packages/devfoxx/admin-panel');
        $this->line('  2. Commit and tag the package release');
        $this->line('  3. Update consumer apps with composer update devfoxx/devfoxx-laravel-admin-panel');

        return self::SUCCESS;
    }
}
