#!/bin/bash

docker-compose -f docker-compose-prod.yml build --pull &&
docker-compose -f docker-compose-prod.yml up -d
docker-compose -f docker-compose-prod.yml logs dev
