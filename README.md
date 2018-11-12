# fauxauth

[![License](https://img.shields.io/github/license/textbook/fauxauth.svg)](https://github.com/textbook/fauxauth/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/textbook/fauxauth.svg?branch=master)](https://travis-ci.org/textbook/fauxauth)
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
| `accessToken`  | The access token to return (randomly generated otherwise)  | `null`                                       |
| `callbackUrl`  | The base URL to return or validate `redirect_uri` against  | `"http://example.org/"`                      |
| `clientId`     | The client ID to be accepted by the `/authorize` endpoint  | `"1ae9b0ca17e754106b51"`                     |
| `clientSecret` | The client secret required by the `/access_token` endpoint | `"3efb56fdbac1cb21f3d4fea9b70036e04a34d068"` |
| `codes`        | The array of valid codes accepted by `/access_token`       | `[]`                                         |

You can update this configuration by sending a `PATCH` to the `/_configuration`
endpoint, which accepts the changes as a [JSON patch][5] request. A `GET` to the
same endpoint provides the current configuration. You can reset to the default
configuration using a `DELETE` request.

[1]: https://docs.docker.com/compose/
[2]: https://www.npmjs.com/package/concurrently
[3]: https://www.npmjs.com/package/cross-env
[4]:
  https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#web-application-flow
[5]: http://jsonpatch.com/
