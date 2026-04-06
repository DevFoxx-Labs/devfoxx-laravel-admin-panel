<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Gallery</title>
    <style>
        body{font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:2rem}
        .container{max-width:1280px;margin:0 auto}
        .grid{display:grid;grid-template-columns:2fr 1fr;gap:1rem;align-items:start}
        .card,.stat{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:1rem;box-shadow:0 10px 25px rgba(15,23,42,.05)}
        .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:1rem;margin-bottom:1rem}
        label{display:block;font-size:.9rem;font-weight:600;margin-bottom:.35rem}
        input,select,textarea,button{width:100%;padding:.7rem;border:1px solid #cbd5e1;border-radius:10px;box-sizing:border-box}
        textarea{min-height:100px;resize:vertical}
        .row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
        .actions{display:flex;gap:.5rem;flex-wrap:wrap}
        .actions form,.actions a{display:inline-block}
        button,.btn{background:#2563eb;color:#fff;border:none;text-decoration:none;cursor:pointer;padding:.65rem 1rem;border-radius:10px}
        .btn.secondary,button.secondary{background:#475569}
        .btn.warn,button.warn{background:#dc2626}
        table{width:100%;border-collapse:collapse}
        th,td{padding:.75rem;border-bottom:1px solid #e2e8f0;vertical-align:top;text-align:left}
        .flash{padding:.85rem 1rem;border-radius:12px;margin-bottom:1rem}
        .success{background:#dcfce7;color:#166534}
        .error{background:#fee2e2;color:#991b1b}
        .muted{color:#64748b}
        @media (max-width: 900px){.grid,.row{grid-template-columns:1fr}}
    </style>
</head>
<body>
<div class="container">
    <h1>DevFoxx Admin Panel</h1>
    <p class="muted">Reusable gallery manager shipped from the package. Current public route: <strong>/{{ trim(config('admin-panel.public_path', 'package-gallery'), '/') }}</strong></p>

    @if (session('success'))
        <div class="flash success">{{ session('success') }}</div>
    @endif

    @if ($errors->any())
        <div class="flash error">
            <strong>Please fix the following:</strong>
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="stats">
        <div class="stat"><strong>Total</strong><div>{{ $stats['total'] }}</div></div>
        <div class="stat"><strong>Active</strong><div>{{ $stats['active'] }}</div></div>
        <div class="stat"><strong>Videos</strong><div>{{ $stats['video'] }}</div></div>
        <div class="stat"><strong>Featured</strong><div>{{ $stats['featured'] }}</div></div>
        <div class="stat"><strong>Trashed</strong><div>{{ $stats['trashed'] }}</div></div>
    </div>

    <div class="grid">
        <div class="card">
            <h2>{{ $editing ? 'Edit gallery item' : 'Create gallery item' }}</h2>
            <form method="POST" action="{{ $editing ? route('admin-panel.gallery.update', $editing) : route('admin-panel.gallery.store') }}" enctype="multipart/form-data">
                @csrf
                @if ($editing)
                    @method('PUT')
                @endif

                <div class="row">
                    <div>
                        <label for="title">Title</label>
                        <input id="title" type="text" name="title" value="{{ old('title', $editing->title ?? '') }}" required>
                    </div>
                    <div>
                        <label for="media_type">Media type</label>
                        <select id="media_type" name="media_type">
                            <option value="image" @selected(old('media_type', $editing->media_type ?? 'image') === 'image')>Image</option>
                            <option value="video" @selected(old('media_type', $editing->media_type ?? '') === 'video')>Video</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top:1rem">
                    <label for="description">Description</label>
                    <textarea id="description" name="description">{{ old('description', $editing->description ?? '') }}</textarea>
                </div>

                <div class="row" style="margin-top:1rem">
                    <div>
                        <label for="media_file">Media file {{ $editing ? '(optional while updating)' : '' }}</label>
                        <input id="media_file" type="file" name="media_file" {{ $editing ? '' : 'required' }}>
                    </div>
                    <div>
                        <label for="thumbnail_file">Thumbnail file</label>
                        <input id="thumbnail_file" type="file" name="thumbnail_file">
                    </div>
                </div>

                <div class="row" style="margin-top:1rem">
                    <div>
                        <label for="alt_text">Alt text</label>
                        <input id="alt_text" type="text" name="alt_text" value="{{ old('alt_text', $editing->alt_text ?? '') }}">
                    </div>
                    <div>
                        <label for="sort_order">Sort order</label>
                        <input id="sort_order" type="number" name="sort_order" min="0" value="{{ old('sort_order', $editing->sort_order ?? 0) }}">
                    </div>
                </div>

                <div class="row" style="margin-top:1rem">
                    <div>
                        <label for="published_at">Published at</label>
                        <input id="published_at" type="datetime-local" name="published_at" value="{{ old('published_at', isset($editing) && $editing?->published_at ? $editing->published_at->format('Y-m-d\TH:i') : '') }}">
                    </div>
                    <div class="row">
                        <div>
                            <label for="is_active">Active</label>
                            <select id="is_active" name="is_active">
                                <option value="1" @selected((bool) old('is_active', $editing->is_active ?? true))>Yes</option>
                                <option value="0" @selected(! (bool) old('is_active', $editing->is_active ?? true))>No</option>
                            </select>
                        </div>
                        <div>
                            <label for="is_featured">Featured</label>
                            <select id="is_featured" name="is_featured">
                                <option value="1" @selected((bool) old('is_featured', $editing->is_featured ?? false))>Yes</option>
                                <option value="0" @selected(! (bool) old('is_featured', $editing->is_featured ?? false))>No</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="actions" style="margin-top:1rem">
                    <button type="submit">{{ $editing ? 'Update item' : 'Create item' }}</button>
                    @if ($editing)
                        <a class="btn secondary" href="{{ route('admin-panel.gallery.index') }}">Cancel edit</a>
                    @endif
                </div>
            </form>
        </div>

        <div class="card">
            <h2>Filter items</h2>
            <form method="GET" action="{{ route('admin-panel.gallery.index') }}">
                <div>
                    <label for="search">Search</label>
                    <input id="search" type="text" name="search" value="{{ $filters['search'] ?? '' }}" placeholder="title, description, alt text">
                </div>

                <div style="margin-top:1rem">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="">All</option>
                        <option value="active" @selected(($filters['status'] ?? '') === 'active')>Active</option>
                        <option value="inactive" @selected(($filters['status'] ?? '') === 'inactive')>Inactive</option>
                        <option value="featured" @selected(($filters['status'] ?? '') === 'featured')>Featured</option>
                        <option value="trashed" @selected(($filters['status'] ?? '') === 'trashed')>Trashed</option>
                    </select>
                </div>

                <div style="margin-top:1rem">
                    <label for="media_type_filter">Media type</label>
                    <select id="media_type_filter" name="media_type">
                        <option value="">All</option>
                        <option value="image" @selected(($filters['media_type'] ?? '') === 'image')>Image</option>
                        <option value="video" @selected(($filters['media_type'] ?? '') === 'video')>Video</option>
                    </select>
                </div>

                <div class="actions" style="margin-top:1rem">
                    <button type="submit">Apply filters</button>
                    <a class="btn secondary" href="{{ route('admin-panel.gallery.index') }}">Reset</a>
                </div>
            </form>
        </div>
    </div>

    <div class="card" style="margin-top:1rem">
        <h2>Gallery items</h2>
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Sort</th>
                    <th>Media</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($galleryItems as $item)
                    <tr>
                        <td>
                            <strong>{{ $item->title }}</strong><br>
                            <span class="muted">{{ $item->description ?: 'No description' }}</span>
                        </td>
                        <td>{{ ucfirst($item->media_type) }}</td>
                        <td>
                            {{ $item->deleted_at ? 'Trashed' : ($item->is_active ? 'Active' : 'Inactive') }}
                            @if ($item->is_featured)
                                / Featured
                            @endif
                        </td>
                        <td>{{ $item->sort_order }}</td>
                        <td>
                            @if ($item->media_url)
                                <a class="btn secondary" href="{{ $item->media_url }}" target="_blank">Open</a>
                            @endif
                        </td>
                        <td>
                            <div class="actions">
                                <a class="btn secondary" href="{{ route('admin-panel.gallery.index', array_merge(request()->query(), ['edit' => $item->id])) }}">Edit</a>

                                @if (! $item->deleted_at)
                                    <form method="POST" action="{{ route('admin-panel.gallery.toggle-featured', $item) }}">
                                        @csrf
                                        @method('PATCH')
                                        <button type="submit" class="secondary">Toggle featured</button>
                                    </form>

                                    <form method="POST" action="{{ route('admin-panel.gallery.toggle-active', $item) }}">
                                        @csrf
                                        @method('PATCH')
                                        <button type="submit" class="secondary">Toggle active</button>
                                    </form>

                                    <form method="POST" action="{{ route('admin-panel.gallery.destroy', $item) }}">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="warn">Trash</button>
                                    </form>
                                @else
                                    <form method="POST" action="{{ route('admin-panel.gallery.restore', $item->id) }}">
                                        @csrf
                                        @method('PATCH')
                                        <button type="submit" class="secondary">Restore</button>
                                    </form>

                                    <form method="POST" action="{{ route('admin-panel.gallery.force-delete', $item->id) }}">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="warn">Delete forever</button>
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6">No records found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div style="margin-top:1rem">
            {{ $galleryItems->links() }}
        </div>
    </div>
</div>
</body>
</html>
