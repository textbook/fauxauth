#! /usr/bin/env bash

set -x -e

HERE="$(dirname "$0")"

pushd $HERE
    npm ci
    npm install "fauxauth@$TRAVIS_TAG"
    npm run e2e
popd
