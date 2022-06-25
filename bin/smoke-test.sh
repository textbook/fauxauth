#! /usr/bin/env bash

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: ./smoke-test.sh <tag>"
  echo "This will run the smoke tests for the specified release tag"
  exit 1
fi

TAG=$1

HERE="$(dirname "$0")"

pushd "$HERE/../packages/e2e"
    NODE_RELEASE="$(cat ../../.nvmrc)"

    docker -v
    echo "Node version $NODE_RELEASE"

    npm install
    npm install "fauxauth@$TAG" --no-save
    npm run chromedriver
    npm run e2e
    NODE_RELEASE="$NODE_RELEASE" TAG="$TAG" npm run docker
popd
