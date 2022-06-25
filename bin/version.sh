#! /usr/bin/env bash

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: ./bin/version.sh <version>"
  echo "This will update the version for all packages"
  exit 1
fi

HERE="$(dirname "$0")"

pushd "$HERE/.."
    VERSION="$(npm version --no-git-tag-version "$1")"
    npm --workspaces version "$VERSION"
    npm install  # update lockfile
    git add package*.json
    git add packages/**/*.json
    git commit --message "$VERSION"
    git tag "$VERSION"
popd
