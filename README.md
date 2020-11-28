# fauxauth

[![License](https://img.shields.io/github/license/textbook/fauxauth.svg)](https://github.com/textbook/fauxauth/blob/main/LICENSE)
[![Build Status](https://circleci.com/gh/textbook/fauxauth.svg?style=svg)](https://circleci.com/gh/textbook/fauxauth)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ec914e9fdeba3ccb3e0b/test_coverage)](https://codeclimate.com/github/textbook/fauxauth/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/ec914e9fdeba3ccb3e0b/maintainability)](https://codeclimate.com/github/textbook/fauxauth/maintainability)
[![NPM Version](https://img.shields.io/npm/v/fauxauth.svg)](https://www.npmjs.com/package/fauxauth)
[![Docker Image](https://img.shields.io/microbadger/image-size/textbook/fauxauth/latest.svg)](https://hub.docker.com/r/textbook/fauxauth/)

Helper application for testing OAuth clients

## What is this?

`fauxauth` is a mock server for testing applications that are using OAuth
authentication. Specifically, it was created to pretend to be GitHub's OAuth
flow, as documented [here][4].

## How can I use it?

`fauxauth` is set up for two primary use cases:

- **Docker**: if you're developing or testing your app using Docker containers,
  you can make `fauxauth` part of a multi-container network using [Compose][1].

  Assuming an app that will locate the OAuth provider via an `OAUTH_URL`
  environment variable, your `docker-compose.yml` could look something like:

  ```
  version: '3'
  services:
      some_app:
          ...
          links:
            - oauth
          environment:
              OAUTH_URL: http://oauth
      ...
      oauth:
          image: textbook/fauxauth
  ```

  You should generally specify a tag to use, rather than use the default
  `:latest`; the build process for release `vX.Y.Z` creates the tags `:vX`,
  `:vX.Y` and `:vX.Y.Z` and publishes them all to Docker Hub, so you can pick
  a level of stability you're comfortable with (e.g. `:v2` is equivalent to
  NPM semver's `^2.0.0`, whereas `:v2.1` is equivalent to `~2.1.0`).

- **Node Dependency**: alternatively, you may want to run `fauxauth` directly.
  You can install it from NPM as follows:

  ```bash
  npm install fauxauth --save-dev  # or "yarn add fauxauth -D"
  ```

  Once installed, you can add it to one of your `package.json` scripts. I find
  [`concurrently`][2] useful for simplifying development tasks like this, e.g.

  ```json
  {
      ...
      "scripts": {
          ...
          "dev": "concurrently -n \"fauxauth,some_app\" \"npm run fauxauth\" \"npm start\""
      }
  }
  ```

### Compatibility

The compiled version of `fauxauth`, as released to NPM, is tested against the
latest versions of three Node LTS releases: Dubnium (10), Erbium (12) and
Fermium (14). Compilation is carried out using TypeScript in the Node version
specified in `.nvmrc`.

### Configuration

You can configure the port that the `fauxauth` server runs on by setting the
`PORT` environment variable, e.g. using [`cross-env`][3] in your scripts:

```json
{
    ...
    "scripts": {
        ...
        "fauxauth": "cross-env PORT=3210 fauxauth"
    }
}
```

You can also set the OAuth configuration; it is initially hardcoded as follows:

| Name           | Description                                                | Initial value                                |
| -------------- | ---------------------------------------------------------- | -------------------------------------------- |
| `callbackUrl`  | The base URL to return or validate `redirect_uri` against  | `"http://example.org/"`                      |
| `clientId`     | The client ID to be accepted by the `/authorize` endpoint  | `"1ae9b0ca17e754106b51"`                     |
| `clientSecret` | The client secret required by the `/access_token` endpoint | `"3efb56fdbac1cb21f3d4fea9b70036e04a34d068"` |
| `codes`        | The codes accepted by `/access_token` and their tokens     | `{}`                                         |
| `tokenMap`     | A map from choices (e.g. roles) to a token for that choice | `undefined`                                  |

You can update this configuration by sending a `PATCH` to the `/_configuration`
endpoint, which accepts the changes as a [JSON patch][5] request. A `GET` to the
same endpoint provides the current configuration. You can reset to the default
configuration using a `DELETE` request.

Alternatively, provide a JSON string as the `FAUXAUTH_CONFIG` environment
variable to override all or part of the initial configuration (**note** that a
`DELETE` reset will return to the combination of the hardcoded configuration
above and whatever is provided via this environment variable).

### Token map

_(New in v4)_

If you set a token map, instead of immediately redirecting to the specified
redirect URI, `fauxauth` will render a page where the user can select which
token they want to use. For example, given the following `FAUXAUTH_CONFIG`:

```json
{
  "tokenMap": {
    "Headteacher": "86d66c5b7532a0083612",
    "Teacher": "1d4fdc5bb3aefa5a01dd",
    "Student": "4d39f64b071e49aeedce"
  }
}
```

something like the following form will be rendered:

```html
<form action="" id="root-form">
    <label for="role-select">
        Select token
        <select id="role-select">
            <option value="288e5e60aa9220000000">Headteacher</option>
            <option value="c4f9e4bfffa600000000">Teacher</option>
            <option value="76555f344527c0000000">Student</option>
        </select>
    </label>
    <button id="submit-button" type="submit">Authenticate</button>
</form>
```

When the form is submitted, the location will be changed to the specified
redirect URI but with the code replaced with the choice value (e.g.
`http://example.org/?code=c4f9e4bfffa600000000`). The correct request to the
`/access_token` endpoint with that code will recover the specified token,
`1d4fdc5bb3aefa5a01dd`.

For example, this allows you to configure tokens representing different roles,
so that a developer or automated test can choose the appropriate role to "log
in" as.

## How can I work on it?

Fork and clone the repository to your local machine, then run `npm run
install:all` to install the relevant dependencies in both the root directory
and `e2e/`.

To run the full automated validation suite (lint, build and test), run `npm
run ship`.

[1]: https://docs.docker.com/compose/
[2]: https://www.npmjs.com/package/concurrently
[3]: https://www.npmjs.com/package/cross-env
[4]:
  https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#web-application-flow
[5]: http://jsonpatch.com/
