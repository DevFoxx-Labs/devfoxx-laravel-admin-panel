<?php

namespace DevFoxx\AdminPanel\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGalleryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        $permission = (string) config('admin-panel.permission', '');

        if ($permission === '') {
            return true;
        }

        return (bool) $this->user()?->can($permission);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => filter_var($this->input('is_active', false), FILTER_VALIDATE_BOOLEAN),
            'is_featured' => filter_var($this->input('is_featured', false), FILTER_VALIDATE_BOOLEAN),
            'sort_order' => (int) ($this->input('sort_order', 0) ?: 0),
        ]);
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch');
        $gallery = $this->route('gallery');
        $requiresReplacementFile = $isUpdate
            && $gallery
            && $gallery->media_type !== $this->input('media_type');

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'media_type' => ['required', Rule::in(['image', 'video'])],
            'media_file' => [
                ($isUpdate && ! $requiresReplacementFile) ? 'nullable' : 'required',
                'file',
                'max:51200',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (! $value) {
                        return;
                    }

                    $type = $this->input('media_type');
                    $allowed = $type === 'video'
                        ? ['video/mp4', 'video/webm', 'video/quicktime']
                        : ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

                    if (! in_array($value->getMimeType(), $allowed, true)) {
                        $fail('The uploaded file type does not match the selected media type.');
                    }
                },
            ],
            'thumbnail_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
