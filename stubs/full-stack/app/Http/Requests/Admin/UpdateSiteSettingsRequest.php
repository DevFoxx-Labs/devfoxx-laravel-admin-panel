<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSiteSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user
            ? ($user->can('manage site settings') || $user->can('manage seo settings'))
            : false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'site_name' => ['required', 'string', 'max:150'],
            'site_tagline' => ['nullable', 'string', 'max:255'],
            'site_email' => ['nullable', 'email', 'max:255'],
            'site_phone' => ['nullable', 'string', 'max:60'],
            'site_address' => ['nullable', 'string', 'max:500'],
            'timezone' => ['required', 'string', 'max:100'],
            'maintenance_mode_message' => ['nullable', 'string', 'max:1000'],
            'seo_meta_title' => ['nullable', 'string', 'max:255'],
            'seo_meta_description' => ['nullable', 'string', 'max:1000'],
            'seo_meta_keywords' => ['nullable', 'string', 'max:500'],
            'seo_robots' => ['required', 'string', 'in:index,follow,noindex,follow,index,nofollow,noindex,nofollow'],
            'seo_canonical_url' => ['nullable', 'url', 'max:255'],
            'seo_og_title' => ['nullable', 'string', 'max:255'],
            'seo_og_description' => ['nullable', 'string', 'max:1000'],
            'seo_twitter_card' => ['required', 'string', 'in:summary,summary_large_image'],
        ];
    }
}
