#! /usr/bin/env bash

set -e -x

docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD"

docker build . \
  --label="version=$CIRCLE_TAG" \
  -t 'textbook/fauxauth' \
  -t "textbook/fauxauth:$CIRCLE_TAG"

docker push textbook/fauxauth
