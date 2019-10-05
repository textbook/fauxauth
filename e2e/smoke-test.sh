#! /usr/bin/env bash

set -x -e

HERE="$(dirname "$0")"

pushd $HERE
    npm ci
    npm install "fauxauth@$CIRCLE_TAG"
    npm run e2e
    docker-compose run e2e run -d test
popd
