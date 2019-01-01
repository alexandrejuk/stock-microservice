#!/bin/bash

#set env
NODE_ENV=production

#running migrations
yarn migrate:prod

# Start building process
echo "***** stating build process! *****"
docker-compose -f ./scripts/docker-compose.yml up --build --force-recreate -d server

echo "***** everything is up and running *****"
docker-compose -f ./scripts/docker-compose.yml ps



