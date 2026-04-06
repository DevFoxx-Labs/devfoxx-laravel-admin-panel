<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notification_campaigns', function (Blueprint $table) {
            $table->foreignId('notification_template_id')
                ->nullable()
                ->after('action_url')
                ->constrained('notification_templates')
                ->nullOnDelete();
            $table->json('custom_variables')->nullable()->after('audience_filters');
        });
    }

    public function down(): void
    {
        Schema::table('notification_campaigns', function (Blueprint $table) {
            $table->dropConstrainedForeignId('notification_template_id');
            $table->dropColumn('custom_variables');
        });
    }
};
