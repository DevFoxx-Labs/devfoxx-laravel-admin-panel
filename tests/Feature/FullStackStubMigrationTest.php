<?php

namespace DevFoxx\AdminPanel\Tests\Feature;

use DevFoxx\AdminPanel\Tests\TestCase;
use Illuminate\Support\Facades\Schema;

class FullStackStubMigrationTest extends TestCase
{
    public function test_duplicate_stub_migrations_do_not_crash_when_run_in_sequence(): void
    {
        Schema::dropIfExists('blog_category');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('blogs');
        Schema::dropIfExists('categories');

        $migrationFiles = [
            dirname(__DIR__, 2).'/stubs/full-stack/database/migrations/2026_03_31_181337_create_categories_table.php',
            dirname(__DIR__, 2).'/stubs/full-stack/database/migrations/2026_03_31_181340_create_blogs_table.php',
            dirname(__DIR__, 2).'/stubs/full-stack/database/migrations/2026_03_31_181340_create_blog_category_table.php',
            dirname(__DIR__, 2).'/stubs/full-stack/database/migrations/2026_03_31_181342_create_blog_category_table.php',
            dirname(__DIR__, 2).'/stubs/full-stack/database/migrations/2026_03_31_181341_create_comments_table.php',
            dirname(__DIR__, 2).'/stubs/full-stack/database/migrations/2026_03_31_181343_create_comments_table.php',
        ];

        foreach ($migrationFiles as $migrationFile) {
            $migration = require $migrationFile;
            $migration->up();
        }

        $this->assertTrue(Schema::hasTable('categories'));
        $this->assertTrue(Schema::hasTable('blogs'));
        $this->assertTrue(Schema::hasTable('blog_category'));
        $this->assertTrue(Schema::hasTable('comments'));
    }
}
