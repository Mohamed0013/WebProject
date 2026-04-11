<?php

$defaultOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://localhost',
    'https://127.0.0.1',
];

$rawOrigins = (string) env('CORS_ALLOWED_ORIGINS', implode(',', $defaultOrigins));
$allowedOrigins = array_values(array_filter(array_map('trim', explode(',', $rawOrigins))));

if ($allowedOrigins === []) {
    $allowedOrigins = $defaultOrigins;
}

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
