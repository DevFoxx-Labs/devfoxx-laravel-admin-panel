<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subject')->nullable();
            $table->text('message');
            $table->string('action_url')->nullable();
            $table->json('channels');
            $table->string('audience_type');
            $table->json('audience_filters')->nullable();
            $table->string('status')->default('queued');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('total_recipients')->default(0);
            $table->unsignedBigInteger('processed_recipients')->default(0);
            $table->unsignedBigInteger('sent_recipients')->default(0);
            $table->unsignedBigInteger('failed_recipients')->default(0);
            $table->unsignedBigInteger('skipped_recipients')->default(0);
            $table->timestamp('scheduled_at')->nullable()->index();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_campaigns');
    }
};