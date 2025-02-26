#!/bin/sh

set -e

# Perform all actions as $POSTGRES_USER
export PGUSER="$POSTGRES_USER"

for DB in template_postgis "$POSTGRES_DB" "${@}"; do
    echo "Install unaccent extensions"
    psql --dbname="$DB" -c "
        CREATE EXTENSION IF NOT EXISTS unaccent;
    "
done
