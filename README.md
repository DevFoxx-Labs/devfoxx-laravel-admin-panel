# DevFoxx Laravel Admin Panel Package

This package can now be used in **two ways**:

1. **package mode** – install the reusable gallery/admin package
2. **full-stack mode** – publish the current app structure, routes, migrations, and React/Inertia UI into a fresh Laravel app

## What is included

- reusable service provider
- package config
- package routes
- gallery model + migration
- Blade admin/public fallback UI
- optional React/Inertia UI publishing
- optional full app scaffolding publishing from the current project structure
- install command: `php artisan devfoxx-admin-panel:install`

## Local development

For monorepo or demo-app development, consume the package through a Composer path repository:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "packages/devfoxx/admin-panel",
      "options": {
        "symlink": true
      }
    }
  ]
}
```

Then require it in the host app and test changes locally with normal Laravel and Vite workflows.

## Install modes

### 1) Reusable package mode

```bash
composer require dev-karunendu-mishra/devfoxx-laravel-admin-panel
php artisan devfoxx-admin-panel:install --with-migrations
php artisan migrate
php artisan storage:link
```

### 2) Full app + current UI mode

> Best for a **fresh Laravel app** where you want the same structure and UI as this project.
>
> **Important:** this mode publishes files as copies into the host app. Later package updates will not automatically change those copied files unless you publish again with `--force`.

```bash
composer require dev-karunendu-mishra/devfoxx-laravel-admin-panel
php artisan devfoxx-admin-panel:install --full-stack --with-ui --with-migrations --force
php artisan migrate --seed
php artisan storage:link
npm install
npm install @inertiajs/react @headlessui/react antd @ant-design/icons axios react react-dom
npm run build
```

Then set in your `.env` or published config:

```env
DEVFOXX_ADMIN_PANEL_UI_STACK=inertia
```

## Published content in full-stack mode

- `app/Http`, `app/Models`, `app/Services`, `app/Jobs`, `app/Mail`
- `config/*.php`
- `database/migrations`, `database/seeders`
- `resources/js`, `resources/css`, `resources/views`
- `routes/*.php`
- `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `jsconfig.json`

## Package-owned React/Inertia runtime assets

When you set:

```env
DEVFOXX_ADMIN_PANEL_UI_STACK=inertia
```

the package renders these runtime-owned Inertia pages directly from the installed package:

- `Vendor/AdminPanel/Gallery/Index`
- `Vendor/AdminPanel/Admin/Gallery/Index`

In the host app, make sure `resources/js/app.jsx` resolves package pages:

```jsx
import { withAdminPanelPages } from '../../vendor/dev-karunendu-mishra/devfoxx-laravel-admin-panel/resources/js/inertia';

const pages = withAdminPanelPages(import.meta.glob('./Pages/**/*.jsx'));
```

This means UI code stays in the package under `vendor/dev-karunendu-mishra/devfoxx-laravel-admin-panel/resources/js/**` and arrives through normal package updates. After updating the package, rebuild frontend assets:

```bash
composer update dev-karunendu-mishra/devfoxx-laravel-admin-panel
npm run build
```

> Local app pages still override package pages if you keep the same component names in `resources/js/Pages`.

## Default URLs

- public gallery: `/package-gallery`
- admin gallery: `/package-admin/gallery`

You can change these in `config/admin-panel.php` after publishing the config.

## Keeping the package updated when this app changes

### Recommended workflow

Use the **package as the source of truth**.

- build reusable code in `packages/devfoxx/admin-panel`
- test it in this app through the local Composer path repository
- release a new package version
- run `composer update dev-karunendu-mishra/devfoxx-laravel-admin-panel` in other apps

### If you changed the app first

Sync the current app back into the package stubs with:

```bash
php artisan devfoxx-admin-panel:sync-stubs --clean
```

Then:

```bash
git add packages/devfoxx/admin-panel
git commit -m "Sync package from app changes"
git tag v1.0.1
git push origin master --tags
```

In other Laravel apps:

```bash
composer update dev-karunendu-mishra/devfoxx-laravel-admin-panel
```

## Publish to GitHub and Packagist

1. Move this package folder into its own repository, for example `dev-karunendu-mishra/devfoxx-laravel-admin-panel`.
2. Push the repository to GitHub.
3. Create a release tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

4. Submit the GitHub repository to [Packagist](https://packagist.org/packages/submit).
5. Install from other apps with:

```bash
composer require dev-karunendu-mishra/devfoxx-laravel-admin-panel
```
