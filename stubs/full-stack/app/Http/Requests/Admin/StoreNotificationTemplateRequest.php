<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreNotificationTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('manage notifications');
    }

    protected function prepareForValidation(): void
    {
        $slug = $this->filled('slug')
            ? Str::slug((string) $this->input('slug'))
            : Str::slug((string) $this->input('name'));

        $this->merge([
            'slug' => $slug,
            'is_active' => $this->boolean('is_active', true),
        ]);
    }

    public function rules(): array
    {
        $templateId = $this->route('notificationTemplate')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('notification_templates', 'slug')->ignore($templateId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'subject_template' => ['nullable', 'string', 'max:255'],
            'message_template' => ['required', 'string', 'max:10000'],
            'action_url_template' => ['nullable', 'url', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
