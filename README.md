# DevFoxx Laravel Admin Panel Package

`devfoxx/devfoxx-laravel-admin-panel` is a broader **Laravel admin panel starter/package**, not just a gallery module.

It currently bundles or scaffolds the following areas:

- gallery and media library management
- blog posts, categories, and comments
- testimonials management
- CMS pages and public page rendering
- notification campaigns, templates, retry flows, and webhooks
- access control for roles, users, and permissions
- site settings and SEO settings
- auth/profile and push-device related flows
- Blade fallback UI and package-owned React/Inertia runtime UI
- optional full-stack starter scaffolding for fresh Laravel applications

> At the moment, **Gallery** is the first fully package-owned runtime module. The rest of the admin suite is already included through the `full-stack` scaffolding layer and can be published into fresh Laravel apps.

Repository: `https://github.com/DevFoxx-Labs/devfoxx-laravel-admin-panel`

---

## Requirements

- PHP `^8.2`
- Laravel `^11.0 | ^12.0`
- Node.js + npm for React/Inertia builds

---

## Installation

### 1) Standard package mode

```bash
composer require devfoxx/devfoxx-laravel-admin-panel
php artisan devfoxx-admin-panel:install --with-migrations
php artisan migrate
php artisan storage:link
```

### 2) Full-stack mode

Use this on a **fresh Laravel app** when you want the current DevFoxx structure and UI.

```bash
composer require devfoxx/devfoxx-laravel-admin-panel
php artisan devfoxx-admin-panel:install --full-stack --with-ui --with-migrations --force
php artisan migrate --seed
php artisan storage:link
npm install
npm install @inertiajs/react @headlessui/react antd @ant-design/icons axios react react-dom
npm run build
```

Then enable the React/Inertia UI:

```env
DEVFOXX_ADMIN_PANEL_UI_STACK=inertia
```

> `--full-stack` publishes files as copies into the host app. Those copies do not auto-update unless re-published with `--force`.

---

## Module coverage at a glance

| Area | Current status | Notes |
|---|---|---|
| Gallery / media library | **Native package module** | Fully wired into the package with Blade and React/Inertia runtime UI |
| Blog / categories / comments | **Full-stack scaffold included** | Published into fresh apps through `--full-stack` |
| CMS pages / public page rendering | **Full-stack scaffold included** | Includes admin page management and dynamic public routes |
| Testimonials | **Full-stack scaffold included** | Includes CRUD, featured toggles, restore, and ordering |
| Notifications / campaigns / templates / webhooks | **Full-stack scaffold included** | Includes campaign management, retries, and webhook endpoints |
| Access control / roles / users | **Full-stack scaffold included** | Built around permissions and admin access flows |
| Site settings / SEO | **Full-stack scaffold included** | Settings controllers, config, and related admin UI |
| Auth / profile / push devices | **Full-stack scaffold included** | Included in the starter structure for the host app |

This means the package already represents a broader **admin panel ecosystem**, while the Gallery module is currently the most package-native runtime feature.

---

## Package-owned React/Inertia runtime UI

When `DEVFOXX_ADMIN_PANEL_UI_STACK=inertia` is enabled, the package renders these Inertia pages from the installed package itself:

- `Vendor/AdminPanel/Gallery/Index`
- `Vendor/AdminPanel/Admin/Gallery/Index`

In the host app, make sure `resources/js/app.jsx` resolves package pages:

```jsx
import { withAdminPanelPages } from '../../vendor/devfoxx/devfoxx-laravel-admin-panel/resources/js/inertia';

const pages = withAdminPanelPages(import.meta.glob('./Pages/**/*.jsx'));
```

After updating the package in a consuming app, rebuild frontend assets:

```bash
composer update devfoxx/devfoxx-laravel-admin-panel
npm run build
```

> Local app pages can still override package pages if they use the same component names under `resources/js/Pages`.

---

## Available routes and modules

### Package-native routes today

- Public gallery: `/package-gallery`
- Admin gallery: `/package-admin/gallery`

These can be customized in the published `config/admin-panel.php`.

### Full-stack routes available after scaffold publish

Once you install with `--full-stack`, the starter also includes routes and UI for areas such as:

- `/admin/access-control`
- `/admin/settings`
- `/admin/blogs`
- `/admin/categories`
- `/admin/pages`
- `/admin/testimonials`
- `/admin/notifications`
- `/blog`
- `/gallery`
- `/testimonials`
- dynamic CMS pages via `/{path}`

---

## Useful commands

### Install package resources

```bash
php artisan devfoxx-admin-panel:install
```

### Sync publishable stubs from the host app back into the package

```bash
php artisan devfoxx-admin-panel:sync-stubs --clean
```

---

## Local development

If you want to test this package from another local Laravel app, add a Composer path repository:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "../devfoxx-laravel-admin-panel",
      "options": {
        "symlink": true
      }
    }
  ]
}
```

Then require it in the host app:

```bash
composer require devfoxx/devfoxx-laravel-admin-panel:@dev
```

---

## Release workflow

Use this repository as the **source of truth**.

### Validate before release

```bash
composer validate --strict
composer test
```

### Publish a new release

```bash
git add .
git commit -m "Prepare release"
git tag v1.0.0
git push origin main --tags
```

### Update consumer apps

```bash
composer update devfoxx/devfoxx-laravel-admin-panel
npm run build
```

---

## GitHub and Packagist publishing

1. Push this repository to GitHub:
   - `https://github.com/DevFoxx-Labs/devfoxx-laravel-admin-panel`
2. Ensure the repository is **public**.
3. Make sure the package code is available on the default branch (`main`).
4. Create and push a semantic version tag such as `v1.0.0`.
5. Submit the GitHub repository URL to [Packagist](https://packagist.org/packages/submit).
6. Enable the Packagist GitHub webhook for automatic sync on future pushes.

Install in other apps with:

```bash
composer require devfoxx/devfoxx-laravel-admin-panel
```
