#! /usr/bin/env bash

set -e -x

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker push textbook/fauxauth
