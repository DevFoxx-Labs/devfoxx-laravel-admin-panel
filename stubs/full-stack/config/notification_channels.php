<?php

return [
    'queue' => env('NOTIFICATION_QUEUE', 'notifications'),

    'dispatch_chunk_size' => (int) env('NOTIFICATION_DISPATCH_CHUNK_SIZE', 1000),

    'delivery_chunk_size' => (int) env('NOTIFICATION_DELIVERY_CHUNK_SIZE', 250),

    'retry_chunk_size' => (int) env('NOTIFICATION_RETRY_CHUNK_SIZE', 250),

    'sms' => [
        'driver' => env('SMS_DRIVER', 'log'),
    ],

    'whatsapp' => [
        'driver' => env('WHATSAPP_DRIVER', 'log'),
    ],

    'push' => [
        'driver' => env('PUSH_DRIVER', 'log'),
    ],
];