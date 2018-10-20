#! /usr/bin/env bash

docker build -t "textbook/fauxauth:$TRAVIS_TAG" -t 'textbook/fauxauth:latest' .

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker push textbook/fauxauth
