import request from "supertest";
import { parse, format } from "url";

import appFactory from "../../src/app";
import { generateConfiguration } from "../../src/utils";

describe("authorize endpoint", () => {
  const endpoint = "/authorize";

  let app;
  let defaultConfiguration;

  beforeEach(() => {
    defaultConfiguration = generateConfiguration();
    app = appFactory(defaultConfiguration);
  });

  it("redirects you back to the default callback URL", () => {
    return request(app)
      .get(endpoint)
      .query({ client_id: defaultConfiguration.clientId })
      .expect(302)
      .then((res) => {
        const { query, search, ...url } = parse(res.get("Location"), true);
        expect(format(url)).toBe(defaultConfiguration.callbackUrl);
      });
  });

  it("redirects you back to the specified location if valid", () => {
    const redirectUri = `${defaultConfiguration.callbackUrl}foo/`;

    return request(app)
      .get(endpoint)
      .query({
        client_id: defaultConfiguration.clientId,
        redirect_uri: redirectUri,
      })
      .expect(302)
      .then((res) => {
        const { query, search, ...url } = parse(res.get("Location"), true);
        expect(format(url)).toBe(redirectUri);
      });
  });

  it("rejects invalid redirect URIs", () => {
    return request(app)
      .get(endpoint)
      .query({
        client_id: defaultConfiguration.clientId,
        redirect_uri: "http://elsewhere.com",
      })
      .expect(302)
      .then((res) => {
        const { query, search, ...url } = parse(res.get("Location"), true);
        expect(format(url)).toBe(defaultConfiguration.callbackUrl);
        expect(query.error).toBe("redirect_uri_mismatch");
      });
  });

  it("includes the state if specified", () => {
    const state = "randomstate";

    return request(app)
      .get(endpoint)
      .query({
        client_id: defaultConfiguration.clientId,
        state,
      })
      .expect(302)
      .then((res) => {
        const { query } = parse(res.get("Location"), true);
        expect(query.state).toBe(state);
      });
  });

  it("provides a code", () => {
    return request(app)
      .get(endpoint)
      .query({
        client_id: defaultConfiguration.clientId,
      })
      .expect(302)
      .then((res) => {
        const { query } = parse(res.get("Location"), true);
        expect(query.code).toMatch(/[0-9a-f]{20}/);
      });
  });

  it("rejects unknown clients", () => {
    return request(app)
      .get(endpoint)
      .query({
        client_id: "who-knows",
        redirect_uri: "http://example.org",
      })
      .expect(404);
  });
});
