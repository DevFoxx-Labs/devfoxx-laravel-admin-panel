<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('event_type')->nullable();
            $table->string('provider_reference')->nullable();
            $table->foreignId('notification_delivery_id')->nullable()->constrained('notification_deliveries')->nullOnDelete();
            $table->json('headers')->nullable();
            $table->json('payload')->nullable();
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['provider', 'provider_reference'], 'notification_webhook_events_provider_reference_idx');
            $table->index(['provider', 'status'], 'notification_webhook_events_provider_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_webhook_events');
    }
};
