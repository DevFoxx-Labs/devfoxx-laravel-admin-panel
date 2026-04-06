<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNotificationCampaignRequest;
use App\Http\Requests\Admin\StoreNotificationTemplateRequest;
use App\Jobs\DispatchNotificationCampaignJob;
use App\Jobs\RetryNotificationDeliveryJob;
use App\Models\NotificationCampaign;
use App\Models\NotificationDelivery;
use App\Models\NotificationTemplate;
use App\Models\NotificationWebhookEvent;
use App\Models\User;
use App\Services\Notifications\NotificationTemplateRenderer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $campaignQuery = NotificationCampaign::query()
            ->with(['creator:id,name,email', 'template:id,name'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $campaignQuery->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $campaignQuery->where('status', $request->string('status')->toString());
        }

        $campaigns = $campaignQuery
            ->paginate(10, ['*'], 'campaigns_page')
            ->through(fn (NotificationCampaign $campaign) => [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'subject' => $campaign->subject,
                'channels' => $campaign->channels,
                'audience_type' => $campaign->audience_type,
                'audience_filters' => $campaign->audience_filters,
                'status' => $campaign->status,
                'total_recipients' => $campaign->total_recipients,
                'processed_recipients' => $campaign->processed_recipients,
                'sent_recipients' => $campaign->sent_recipients,
                'failed_recipients' => $campaign->failed_recipients,
                'skipped_recipients' => $campaign->skipped_recipients,
                'scheduled_at' => optional($campaign->scheduled_at)?->toIso8601String(),
                'started_at' => optional($campaign->started_at)?->toIso8601String(),
                'completed_at' => optional($campaign->completed_at)?->toIso8601String(),
                'created_at' => optional($campaign->created_at)?->toIso8601String(),
                'creator' => $campaign->creator?->only(['id', 'name', 'email']),
                'template' => $campaign->template?->only(['id', 'name']),
            ])
            ->withQueryString();

        $deliveryQuery = NotificationDelivery::query()
            ->with(['campaign:id,title', 'user:id,name,email'])
            ->latest();

        if ($request->filled('delivery_search')) {
            $search = $request->string('delivery_search')->toString();

            $deliveryQuery->where(function ($builder) use ($search) {
                $builder
                    ->where('destination', 'like', "%{$search}%")
                    ->orWhere('provider_reference', 'like', "%{$search}%")
                    ->orWhereHas('campaign', fn ($campaignBuilder) => $campaignBuilder->where('title', 'like', "%{$search}%"))
                    ->orWhereHas('user', function ($userBuilder) use ($search) {
                        $userBuilder
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('delivery_status')) {
            $deliveryQuery->where('status', $request->string('delivery_status')->toString());
        }

        if ($request->filled('delivery_channel')) {
            $deliveryQuery->where('channel', $request->string('delivery_channel')->toString());
        }

        if ($request->filled('campaign_id')) {
            $deliveryQuery->where('notification_campaign_id', $request->integer('campaign_id'));
        }

        $deliveries = $deliveryQuery
            ->paginate(15, ['*'], 'deliveries_page')
            ->through(fn (NotificationDelivery $delivery) => [
                'id' => $delivery->id,
                'channel' => $delivery->channel,
                'destination' => $delivery->destination,
                'status' => $delivery->status,
                'provider' => $delivery->provider,
                'provider_reference' => $delivery->provider_reference,
                'external_status' => $delivery->external_status,
                'error_message' => $delivery->error_message,
                'attempt_count' => $delivery->attempt_count,
                'last_attempted_at' => optional($delivery->last_attempted_at)?->toIso8601String(),
                'sent_at' => optional($delivery->sent_at)?->toIso8601String(),
                'delivered_at' => optional($delivery->delivered_at)?->toIso8601String(),
                'failed_at' => optional($delivery->failed_at)?->toIso8601String(),
                'last_webhook_at' => optional($delivery->last_webhook_at)?->toIso8601String(),
                'campaign' => $delivery->campaign?->only(['id', 'title']),
                'user' => $delivery->user?->only(['id', 'name', 'email']),
            ])
            ->withQueryString();

        return Inertia::render('Admin/Notifications/Index', [
            'campaigns' => $campaigns,
            'deliveries' => $deliveries,
            'filters' => $request->only([
                'search',
                'status',
                'delivery_search',
                'delivery_status',
                'delivery_channel',
                'campaign_id',
            ]),
            'roles' => Role::query()->orderBy('name')->pluck('name')->values(),
            'templates' => NotificationTemplate::query()
                ->orderBy('name')
                ->get()
                ->map(fn (NotificationTemplate $template) => [
                    'id' => $template->id,
                    'name' => $template->name,
                    'slug' => $template->slug,
                    'description' => $template->description,
                    'subject_template' => $template->subject_template,
                    'message_template' => $template->message_template,
                    'action_url_template' => $template->action_url_template,
                    'is_active' => $template->is_active,
                ])
                ->values(),
            'templateVariables' => NotificationTemplateRenderer::availableVariables(),
            'stats' => [
                'total' => NotificationCampaign::count(),
                'queued' => NotificationCampaign::whereIn('status', ['queued', 'scheduled'])->count(),
                'processing' => NotificationCampaign::where('status', 'processing')->count(),
                'completed' => NotificationCampaign::where('status', 'completed')->count(),
                'failed_deliveries' => NotificationDelivery::where('status', 'failed')->count(),
                'pending_webhooks' => NotificationDelivery::whereNotNull('provider_reference')
                    ->whereIn('provider', ['twilio', 'onesignal'])
                    ->whereIn('status', ['sent'])
                    ->count(),
                'webhook_events' => NotificationWebhookEvent::count(),
            ],
        ]);
    }

    public function store(StoreNotificationCampaignRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $scheduledAt = filled($validated['scheduled_at'] ?? null) ? $validated['scheduled_at'] : null;
        $template = isset($validated['notification_template_id'])
            ? NotificationTemplate::query()->find($validated['notification_template_id'])
            : null;

        $campaign = NotificationCampaign::create([
            'title' => $validated['title'],
            'subject' => $template?->subject_template ?? ($validated['subject'] ?? null),
            'message' => $template?->message_template ?? $validated['message'],
            'action_url' => $template?->action_url_template ?? ($validated['action_url'] ?? null),
            'notification_template_id' => $template?->id,
            'channels' => $validated['channels'],
            'audience_type' => $validated['audience_type'],
            'audience_filters' => [
                'role_names' => $validated['role_names'] ?? [],
                'user_ids' => $validated['user_ids'] ?? [],
            ],
            'custom_variables' => $validated['custom_variables'] ?? [],
            'status' => $scheduledAt ? 'scheduled' : 'queued',
            'created_by' => $request->user()?->id,
            'scheduled_at' => $scheduledAt,
        ]);

        $dispatch = DispatchNotificationCampaignJob::dispatch($campaign->id)
            ->onQueue(config('notification_channels.queue', 'notifications'));

        if ($scheduledAt) {
            $dispatch->delay($scheduledAt);
        }

        return back()->with('success', 'Notification campaign queued successfully.');
    }

    public function storeTemplate(StoreNotificationTemplateRequest $request): RedirectResponse
    {
        NotificationTemplate::create([
            ...$request->validated(),
            'created_by' => $request->user()?->id,
        ]);

        return back()->with('success', 'Notification template created successfully.');
    }

    public function updateTemplate(StoreNotificationTemplateRequest $request, NotificationTemplate $notificationTemplate): RedirectResponse
    {
        $notificationTemplate->update($request->validated());

        return back()->with('success', 'Notification template updated successfully.');
    }

    public function destroyTemplate(NotificationTemplate $notificationTemplate): RedirectResponse
    {
        if ($notificationTemplate->campaigns()->exists()) {
            $notificationTemplate->update(['is_active' => false]);

            return back()->with('success', 'Template deactivated because it is already used by one or more campaigns.');
        }

        $notificationTemplate->delete();

        return back()->with('success', 'Notification template deleted successfully.');
    }

    public function searchUsers(Request $request): JsonResponse
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $search = $request->string('search')->toString();

        $users = User::query()
            ->select('id', 'name', 'email', 'phone_number', 'whatsapp_number')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%")
                        ->orWhere('whatsapp_number', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->limit(20)
            ->get()
            ->map(fn (User $user) => [
                'value' => $user->id,
                'label' => "{$user->name} ({$user->email})",
            ])
            ->values();

        return response()->json($users);
    }

    public function cancel(NotificationCampaign $notificationCampaign): RedirectResponse
    {
        if (in_array($notificationCampaign->status, ['completed', 'cancelled'], true)) {
            return back()->with('error', 'This campaign can no longer be cancelled.');
        }

        $notificationCampaign->forceFill([
            'status' => 'cancelled',
            'completed_at' => now(),
        ])->save();

        return back()->with('success', 'Notification campaign cancelled.');
    }

    public function retryDelivery(NotificationDelivery $notificationDelivery): RedirectResponse
    {
        if (! in_array($notificationDelivery->status, ['failed', 'skipped'], true)) {
            return back()->with('error', 'Only failed or skipped deliveries can be retried.');
        }

        RetryNotificationDeliveryJob::dispatch($notificationDelivery->id)
            ->onQueue(config('notification_channels.queue', 'notifications'));

        return back()->with('success', 'Delivery retry queued successfully.');
    }

    public function retryCampaignFailures(NotificationCampaign $notificationCampaign): RedirectResponse
    {
        $queuedAny = false;
        $chunkSize = max(1, (int) config('notification_channels.retry_chunk_size', 250));

        $notificationCampaign->deliveries()
            ->whereIn('status', ['failed', 'skipped'])
            ->orderBy('id')
            ->chunkById($chunkSize, function ($deliveries) use (&$queuedAny) {
                foreach ($deliveries as $delivery) {
                    RetryNotificationDeliveryJob::dispatch($delivery->id)
                        ->onQueue(config('notification_channels.queue', 'notifications'));
                }

                $queuedAny = true;
            });

        if (! $queuedAny) {
            return back()->with('error', 'This campaign has no failed or skipped deliveries to retry.');
        }

        return back()->with('success', 'Retry jobs queued for failed or skipped deliveries.');
    }
}
