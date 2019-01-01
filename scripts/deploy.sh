#!/bin/bash

#running migrations
yarn migrate:prod

# Start building process
echo "***** stating build process! *****"
docker-compose up --build --force-recreate -d

echo "***** everything is up and running *****"
docker-compose ps



