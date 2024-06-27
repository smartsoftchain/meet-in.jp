#! /bin/sh

docker-compose up -d
docker-compose run app cp .env.example .env
docker-compose run app composer install
docker-compose run app php artisan key:generate
docker-compose run app touch ./database/database.sqlite
docker-compose run app php artisan migrate