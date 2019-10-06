#! /usr/bin/env bash

set -e

NODE_RELEASE="$(cat .nvmrc)"

docker -v
echo "Node version $NODE_RELEASE"

echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin

docker build . \
  --label="version=$CIRCLE_TAG" \
  --build-arg "NODE_RELEASE=$NODE_RELEASE" \
  -t 'textbook/fauxauth' \
  -t "textbook/fauxauth:$CIRCLE_TAG"

docker push textbook/fauxauth
