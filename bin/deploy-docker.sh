#! /usr/bin/env bash

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_RELEASE="$(cat "$HERE/../.nvmrc")"

docker -v
echo "Node version $NODE_RELEASE"

echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin

MAJOR="$(echo "$CIRCLE_TAG" | cut -d. -f1)"
MINOR="$(echo "$CIRCLE_TAG" | cut -d. -f2)"
NAME='textbook/fauxauth'

npm run build:docker -- \
  --label "version=$CIRCLE_TAG" \
  --tag "$NAME:$MAJOR" \
  --tag "$NAME:$MAJOR.$MINOR" \
  --tag "$NAME:$CIRCLE_TAG"

docker push "$NAME" --all-tags
