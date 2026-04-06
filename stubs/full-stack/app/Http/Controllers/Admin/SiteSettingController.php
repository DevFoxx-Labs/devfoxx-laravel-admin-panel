<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSiteSettingsRequest;
use App\Models\SiteSetting;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingController extends Controller
{
    /**
     * Settings keys grouped by section for persistence.
     *
     * @var array<string, array<int, string>>
     */
    private const FIELD_GROUPS = [
        'site' => [
            'site_name',
            'site_tagline',
            'site_email',
            'site_phone',
            'site_address',
            'timezone',
            'maintenance_mode_message',
        ],
        'seo' => [
            'seo_meta_title',
            'seo_meta_description',
            'seo_meta_keywords',
            'seo_robots',
            'seo_canonical_url',
            'seo_og_title',
            'seo_og_description',
            'seo_twitter_card',
        ],
    ];

    public function index(): Response
    {
        $settings = SiteSetting::query()->pluck('value', 'key');

        return Inertia::render('Admin/Settings', [
            'settings' => [
                'site_name' => $settings->get('site_name', config('app.name')),
                'site_tagline' => $settings->get('site_tagline', ''),
                'site_email' => $settings->get('site_email', ''),
                'site_phone' => $settings->get('site_phone', ''),
                'site_address' => $settings->get('site_address', ''),
                'timezone' => $settings->get('timezone', config('app.timezone', 'UTC')),
                'maintenance_mode_message' => $settings->get('maintenance_mode_message', ''),
                'seo_meta_title' => $settings->get('seo_meta_title', ''),
                'seo_meta_description' => $settings->get('seo_meta_description', ''),
                'seo_meta_keywords' => $settings->get('seo_meta_keywords', ''),
                'seo_robots' => $settings->get('seo_robots', 'index,follow'),
                'seo_canonical_url' => $settings->get('seo_canonical_url', ''),
                'seo_og_title' => $settings->get('seo_og_title', ''),
                'seo_og_description' => $settings->get('seo_og_description', ''),
                'seo_twitter_card' => $settings->get('seo_twitter_card', 'summary_large_image'),
            ],
        ]);
    }

    public function update(UpdateSiteSettingsRequest $request)
    {
        $validated = $request->validated();

        foreach (self::FIELD_GROUPS as $group => $fields) {
            foreach ($fields as $field) {
                SiteSetting::setValue(
                    $field,
                    $validated[$field] ?? null,
                    $group,
                );
            }
        }

        return back()->with('success', 'Site settings updated successfully.');
    }
}
