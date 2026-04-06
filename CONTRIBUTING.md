# Contributing

## Local release workflow

1. Make reusable changes inside `src/`, `resources/`, `config/`, `routes/`, or `database/`.
2. If the app changed first, sync publishable stubs:

```bash
php artisan devfoxx-admin-panel:sync-stubs --clean
```

3. Run validation:

```bash
composer validate --strict
composer test
```

4. Commit and tag:

```bash
git add .
git commit -m "Prepare release"
git tag v1.0.0
git push origin main --tags
```

5. Update the release notes in `CHANGELOG.md`.
6. If this is the first publish, create the standalone GitHub repo and push it:

```bash
git remote add origin https://github.com/dev-karunendu-mishra/devfoxx-laravel-admin-panel.git
git push -u origin main --tags
```

7. Submit the GitHub repository URL to Packagist and enable the GitHub service hook for auto-updates.
