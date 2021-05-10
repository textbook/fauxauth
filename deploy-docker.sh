#! /usr/bin/env bash

set -e

NODE_RELEASE="$(cat .nvmrc)"

docker -v
echo "Node version $NODE_RELEASE"

echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin

MAJOR="$(echo $CIRCLE_TAG | cut -d. -f1)"
MINOR="$(echo $CIRCLE_TAG | cut -d. -f2)"
NAME='textbook/fauxauth'

docker build . \
  --label="version=$CIRCLE_TAG" \
  --build-arg "NODE_RELEASE=$NODE_RELEASE" \
  -t "$NAME" \
  -t "$NAME:$MAJOR" \
  -t "$NAME:$MAJOR.$MINOR" \
  -t "$NAME:$CIRCLE_TAG"

docker push "$NAME"
