#!/usr/bin/env sh
set -eu

if [ ! -f /var/www/html/.env ] && [ -f /var/www/html/.env.example ]; then
  cp /var/www/html/.env.example /var/www/html/.env
fi

cd /var/www/html

mkdir -p storage/logs bootstrap/cache database
chown -R www-data:www-data storage bootstrap/cache database
chmod -R 775 storage bootstrap/cache

if [ "${APP_ENV:-production}" = "production" ]; then
  php artisan config:cache
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  php artisan migrate --force
fi

exec "$@"
