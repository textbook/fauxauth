import request from "supertest";
import { parse, format } from "url";

import appFactory from "../src/app";

describe("authorize endpoint", () => {
  const endpoint = "/authorize";
  const clientId = "your-name-here";
  const baseUrl = "http://example.org/";
  const app = appFactory({ clientId, callbackUrl: baseUrl, codes: [] });

  it("redirects you back to the default callback URL", () => {
    return request(app)
      .get(endpoint)
      .query({ client_id: clientId })
      .expect(302)
      .then((res) => {
        const { query, search, ...url } = parse(res.get("Location"), true);
        expect(format(url)).toBe(baseUrl);
      });
  });

  it("redirects you back to the specified location if valid", () => {
    const redirectUri = `${baseUrl}foo/`;

    return request(app)
      .get(endpoint)
      .query({ client_id: clientId, redirect_uri: redirectUri })
      .expect(302)
      .then((res) => {
        const { query, search, ...url } = parse(res.get("Location"), true);
        expect(format(url)).toBe(redirectUri);
      });
  });

  it("rejects invalid redirect URIs", () => {
    return request(app)
      .get(endpoint)
      .query({ client_id: clientId, redirect_uri: "http://elsewhere.com" })
      .expect(302)
      .then((res) => {
        const { query, search, ...url } = parse(res.get("Location"), true);
        expect(format(url)).toBe(baseUrl);
        expect(query.error).toBe("redirect_uri_mismatch");
      });
  });

  it("includes the state if specified", () => {
    const state = "randomstate";

    return request(app)
      .get(endpoint)
      .query({
        client_id: clientId,
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
        client_id: clientId,
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
