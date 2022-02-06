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
  --label "version=$CIRCLE_TAG" \
  --build-arg 'ALPINE_RELEASE=3.15' \
  --build-arg "NODE_RELEASE=$NODE_RELEASE" \
  --tag "$NAME" \
  --tag "$NAME:$MAJOR" \
  --tag "$NAME:$MAJOR.$MINOR" \
  --tag "$NAME:$CIRCLE_TAG"

docker push "$NAME" --all-tags
