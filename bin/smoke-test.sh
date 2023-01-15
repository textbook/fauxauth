#! /usr/bin/env bash

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: ./smoke-test.sh <tag>"
  echo "This will run the smoke tests for the specified release tag"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo 'Git working directory not clean.'
  exit 1
fi

TAG=$1

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/.."
E2E="$ROOT/packages/e2e"

pushd "$ROOT"
  NODE_RELEASE="$(cat .nvmrc)"
popd

docker -v
echo "Node version $NODE_RELEASE"

pushd "$E2E"
    NODE_RELEASE="$NODE_RELEASE" TAG="$TAG" npm run docker
popd

cleanup() {
    pushd "$ROOT"
        git checkout package{,-lock}.json
    popd
}

pushd "$ROOT"
    rm -f package*.json
    trap cleanup EXIT
popd

pushd "$E2E"
    npm install --no-package-lock
    npm install "fauxauth@$TAG" --no-package-lock --no-save
    npm run e2e
popd
