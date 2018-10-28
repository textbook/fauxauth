#! /usr/bin/env bash

docker tag 'textbook/fauxauth' "textbook/fauxauth:$TRAVIS_TAG"

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker push textbook/fauxauth
