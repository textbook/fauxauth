#! /usr/bin/env bash

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: ./deploy-docker.sh <tag>"
  echo "This will run the smoke tests for the specified release tag"
  exit 1
fi

TAG=$1

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_RELEASE="$(cat "$HERE/../.nvmrc")"

docker -v
echo "Node version $NODE_RELEASE"

echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin

MAJOR="$(echo "$TAG" | cut -d. -f1)"
MINOR="$(echo "$TAG" | cut -d. -f2)"
NAME='textbook/fauxauth'

npm run build:docker -- \
  --label "version=$TAG" \
  --tag "$NAME:$MAJOR" \
  --tag "$NAME:$MAJOR.$MINOR" \
  --tag "$NAME:$TAG"

docker push "$NAME" --all-tags
