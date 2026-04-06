<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gallery</title>
    <style>
        body{font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:2rem}
        .container{max-width:1200px;margin:0 auto}
        .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:2rem}
        .card,.stat{background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(15,23,42,.05)}
        .stat{padding:1rem}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem}
        .media{width:100%;height:220px;object-fit:cover;background:#0f172a}
        .content{padding:1rem}
        .badge{display:inline-block;padding:.25rem .6rem;border-radius:999px;font-size:.75rem;background:#dbeafe;color:#1d4ed8;margin-right:.4rem}
        .badge.featured{background:#fef3c7;color:#92400e}
        h1,h3,p{margin-top:0}
    </style>
</head>
<body>
    <div class="container">
        <h1>Package Gallery</h1>
        <p>This page is served from the reusable `devfoxx/devfoxx-laravel-admin-panel` package.</p>

        <div class="stats">
            <div class="stat"><strong>Total</strong><div>{{ $stats['total'] }}</div></div>
            <div class="stat"><strong>Images</strong><div>{{ $stats['images'] }}</div></div>
            <div class="stat"><strong>Videos</strong><div>{{ $stats['videos'] }}</div></div>
        </div>

        <div class="grid">
            @forelse ($galleryItems as $item)
                <div class="card">
                    @if ($item->media_type === 'video')
                        <video class="media" controls preload="metadata" @if($item->thumbnail_url) poster="{{ $item->thumbnail_url }}" @endif>
                            <source src="{{ $item->media_url }}">
                        </video>
                    @else
                        <img class="media" src="{{ $item->media_url }}" alt="{{ $item->alt_text ?: $item->title }}">
                    @endif

                    <div class="content">
                        <div>
                            <span class="badge">{{ ucfirst($item->media_type) }}</span>
                            @if ($item->is_featured)
                                <span class="badge featured">Featured</span>
                            @endif
                        </div>
                        <h3>{{ $item->title }}</h3>
                        <p>{{ $item->description ?: 'No description provided.' }}</p>
                    </div>
                </div>
            @empty
                <div class="card">
                    <div class="content">
                        <h3>No gallery items yet</h3>
                        <p>Upload your first image or video from the package admin page.</p>
                    </div>
                </div>
            @endforelse
        </div>
    </div>
</body>
</html>
