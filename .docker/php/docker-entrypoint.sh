#!/bin/sh
set -e

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- php-fpm "$@"
fi

if [ "$1" = 'php-fpm' ] || [ "$1" = 'php' ] || [ "$1" = 'bin/console' ]; then
    # Création des dossiers requis
    mkdir -p var/cache var/log public/build

    # Installation des dépendances
    composer install --prefer-dist --no-progress --no-interaction || true

    # Permissions
    setfacl -R -m u:www-data:rwX -m u:"$(whoami)":rwX var
    setfacl -dR -m u:www-data:rwX -m u:"$(whoami)":rwX var

    # Attendre que la base de données soit prête
    if grep -q DATABASE_URL .env; then
        echo "Waiting for database to be ready..."
        ATTEMPTS_LEFT_TO_REACH_DATABASE=60
        until [ $ATTEMPTS_LEFT_TO_REACH_DATABASE -eq 0 ] || php bin/console doctrine:query:sql "SELECT 1" > /dev/null 2>&1; do
            sleep 1
            ATTEMPTS_LEFT_TO_REACH_DATABASE=$((ATTEMPTS_LEFT_TO_REACH_DATABASE-1))
            echo "Still waiting for database to be ready... $ATTEMPTS_LEFT_TO_REACH_DATABASE attempts left"
        done

        if [ $ATTEMPTS_LEFT_TO_REACH_DATABASE -eq 0 ]; then
            echo "Database is not ready, but continuing anyway"
        else
            echo "Database is ready!"
        fi

        if [ "$APP_ENV" = 'dev' ]; then
            php bin/console doctrine:schema:create --no-interaction || true
        else
            php bin/console doctrine:migrations:migrate --no-interaction || true
        fi
    fi
fi

exec docker-php-entrypoint "$@"
