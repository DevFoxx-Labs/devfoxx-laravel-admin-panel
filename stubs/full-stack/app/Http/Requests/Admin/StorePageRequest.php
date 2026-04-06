<?php

namespace App\Http\Requests\Admin;

use App\Models\Page;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StorePageRequest extends FormRequest
{
    private const RESERVED_PREFIXES = [
        'admin',
        'blog',
        'gallery',
        'dashboard',
        'login',
        'register',
        'logout',
        'profile',
        'testimonials',
        'forgot-password',
        'reset-password',
        'verify-email',
        'confirm-password',
        'storage',
        'up',
    ];

    public function authorize(): bool
    {
        return (bool) $this->user()?->can('manage pages');
    }

    protected function prepareForValidation(): void
    {
        $isHomepage = filter_var($this->input('is_homepage', false), FILTER_VALIDATE_BOOLEAN);
        $path = $this->input('path');

        if (! $isHomepage && blank($path) && filled($this->input('title'))) {
            $path = Str::slug($this->input('title'));
        }

        if (is_string($path)) {
            $path = trim(Str::lower($path), '/');
        }

        $this->merge([
            'path' => $isHomepage ? null : ($path ?: null),
            'show_in_menu' => filter_var($this->input('show_in_menu', false), FILTER_VALIDATE_BOOLEAN),
            'is_homepage' => $isHomepage,
        ]);
    }

    public function rules(): array
    {
        $page = $this->route('page');
        $pageId = $page?->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'path' => [
                Rule::requiredIf(! $this->boolean('is_homepage')),
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/',
                Rule::unique('pages', 'path')->ignore($pageId),
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (! is_string($value) || $value === '') {
                        return;
                    }

                    $firstSegment = Str::before($value, '/');

                    if (in_array($firstSegment, self::RESERVED_PREFIXES, true)) {
                        $fail('This route path conflicts with an existing application route.');
                    }
                },
            ],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
            'show_in_menu' => ['required', 'boolean'],
            'is_homepage' => [
                'required',
                'boolean',
                function (string $attribute, mixed $value, \Closure $fail) use ($pageId) {
                    if (! $value) {
                        return;
                    }

                    $homepageExists = Page::query()
                        ->where('is_homepage', true)
                        ->when($pageId, fn (\Illuminate\Database\Eloquent\Builder $query) => $query->where('id', '!=', $pageId))
                        ->exists();

                    if ($homepageExists) {
                        $fail('Only one page can be assigned as the homepage.');
                    }
                },
            ],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}