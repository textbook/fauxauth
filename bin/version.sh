#! /usr/bin/env bash

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: ./bin/version.sh <version>"
  echo "This will update the version for all packages"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo 'Git working directory not clean.'
  exit 1
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/.."

commitAndTag() {
  git add \
    "$ROOT/package.json" \
    "$ROOT/package-lock.json" \
    "$ROOT/packages/*/package.json"
  git commit --message "$1"
  git tag "$1"
}

npmRun() {
  npm --prefix="$ROOT" "$@"
}

VERSION="$(npmRun version --no-git-tag-version "$1")"
for PACKAGE in e2e fauxauth; do
  npmRun --workspace "$ROOT/packages/$PACKAGE" version "$VERSION"
  npmRun install  # update lockfile
done;
commitAndTag "$VERSION"
