#! /usr/bin/env bash

set -x -e

HERE="$(dirname "$0")"
NODE_RELEASE="$(cat .nvmrc)"

docker -v
echo "Node version $NODE_RELEASE"

pushd "$HERE"
    npm ci
    npm install "fauxauth@$CIRCLE_TAG"
    npm run e2e
    NODE_RELEASE="$NODE_RELEASE" docker-compose run e2e run -d test
popd
