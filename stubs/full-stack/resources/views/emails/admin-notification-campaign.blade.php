<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $content['subject'] ?: $campaign->title }}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.08);">
                    <tr>
                        <td style="padding:24px 28px;background:linear-gradient(135deg,#1677ff,#13c2c2);color:#ffffff;">
                            <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:0.85;">{{ config('app.name') }}</div>
                            <h1 style="margin:12px 0 0;font-size:26px;line-height:1.2;">{{ $content['subject'] ?: $campaign->title }}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px;">
                            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">Hello {{ $user->name }},</p>
                            <div style="font-size:15px;line-height:1.8;white-space:pre-line;">{{ $content['message'] }}</div>

                            @if ($content['action_url'])
                                <div style="margin-top:28px;">
                                    <a href="{{ $content['action_url'] }}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#1677ff;color:#ffffff;text-decoration:none;font-weight:600;">Open Link</a>
                                </div>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>