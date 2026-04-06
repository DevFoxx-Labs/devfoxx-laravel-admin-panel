<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notification_deliveries', function (Blueprint $table) {
            $table->string('provider')->nullable()->after('status');
            $table->string('external_status')->nullable()->after('provider_reference');
            $table->unsignedInteger('attempt_count')->default(0)->after('payload');
            $table->timestamp('last_attempted_at')->nullable()->after('attempt_count');
            $table->timestamp('delivered_at')->nullable()->after('last_attempted_at');
            $table->timestamp('failed_at')->nullable()->after('delivered_at');
            $table->timestamp('last_webhook_at')->nullable()->after('failed_at');

            $table->index(['provider', 'provider_reference'], 'notification_deliveries_provider_reference_idx');
            $table->index(['status', 'channel'], 'notification_deliveries_status_channel_idx');
        });
    }

    public function down(): void
    {
        Schema::table('notification_deliveries', function (Blueprint $table) {
            $table->dropIndex('notification_deliveries_provider_reference_idx');
            $table->dropIndex('notification_deliveries_status_channel_idx');
            $table->dropColumn([
                'provider',
                'external_status',
                'attempt_count',
                'last_attempted_at',
                'delivered_at',
                'failed_at',
                'last_webhook_at',
            ]);
        });
    }
};
