#! /usr/bin/env bash

set -e

echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin

docker build . \
  --label="version=$CIRCLE_TAG" \
  -t 'textbook/fauxauth' \
  -t "textbook/fauxauth:$CIRCLE_TAG"

docker push textbook/fauxauth
