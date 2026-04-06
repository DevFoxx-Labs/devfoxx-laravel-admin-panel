<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNotificationCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('manage notifications');
    }

    protected function prepareForValidation(): void
    {
        $channels = array_values(array_unique(array_filter((array) $this->input('channels', []))));
        $roleNames = array_values(array_unique(array_filter((array) $this->input('role_names', []))));
        $userIds = array_values(array_unique(array_filter((array) $this->input('user_ids', []))));
        $customVariables = $this->input('custom_variables', []);

        if (is_string($customVariables) && $customVariables !== '') {
            $decoded = json_decode($customVariables, true);
            $customVariables = is_array($decoded) ? $decoded : $customVariables;
        }

        $this->merge([
            'channels' => $channels,
            'role_names' => $roleNames,
            'user_ids' => $userIds,
            'custom_variables' => $customVariables === '' ? [] : $customVariables,
            'scheduled_at' => $this->filled('scheduled_at') ? $this->input('scheduled_at') : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'notification_template_id' => ['nullable', 'integer', Rule::exists('notification_templates', 'id')],
            'subject' => [
                Rule::requiredIf(fn () => in_array('email', (array) $this->input('channels', []), true) && ! $this->filled('notification_template_id')),
                'nullable',
                'string',
                'max:255',
            ],
            'message' => [Rule::requiredIf(fn () => ! $this->filled('notification_template_id')), 'nullable', 'string', 'max:10000'],
            'action_url' => ['nullable', 'url', 'max:255'],
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['string', Rule::in(['email', 'sms', 'whatsapp', 'push'])],
            'audience_type' => ['required', Rule::in(['all', 'roles', 'users'])],
            'role_names' => [Rule::requiredIf(fn () => $this->input('audience_type') === 'roles'), 'nullable', 'array', 'min:1'],
            'role_names.*' => ['string', Rule::exists('roles', 'name')],
            'user_ids' => [Rule::requiredIf(fn () => $this->input('audience_type') === 'users'), 'nullable', 'array', 'min:1'],
            'user_ids.*' => ['integer', Rule::exists('users', 'id')],
            'custom_variables' => ['nullable', 'array'],
            'scheduled_at' => ['nullable', 'date', 'after:now'],
        ];
    }
}