#! /usr/bin/env bash

set -e

NODE_RELEASE="$(cat .nvmrc)"

docker -v
echo "Node version $NODE_RELEASE"

echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin

NODE_RELEASE="$NODE_RELEASE" docker build . \
  --label="version=$CIRCLE_TAG" \
  -t 'textbook/fauxauth' \
  -t "textbook/fauxauth:$CIRCLE_TAG"

docker push textbook/fauxauth
