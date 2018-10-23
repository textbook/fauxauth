import request from "supertest";
import { parse, format } from "url";

import appFactory from "../src/app";

describe("authorize endpoint", () => {
  const endpoint = "/authorize";
  const clientId = "your-name-here";
  const app = appFactory({ clientId });

  it("redirects you back to the specified location", () => {
    const redirectUri = "http://example.org/";

    return request(app)
      .get(endpoint)
      .query({ client_id: clientId, redirect_uri: redirectUri })
      .expect(302)
      .then((res) => {
        const { query, search, ...url } = parse(res.get("Location"), true);
        expect(format(url)).toBe(redirectUri);
      });
  });

  it("includes the state if specified", () => {
    const state = "randomstate";

    return request(app)
      .get(endpoint)
      .query({
        client_id: clientId,
        redirect_uri: "http://example.org",
        state,
      })
      .expect(302)
      .then((res) => {
        const { query } = parse(res.get("Location"), true);
        expect(query.state).toBe(state);
      });
  });

  it("provides a code", () => {
    const state = "randomstate";

    return request(app)
      .get(endpoint)
      .query({
        client_id: clientId,
        redirect_uri: "http://example.org",
        state,
      })
      .expect(302)
      .then((res) => {
        const { query } = parse(res.get("Location"), true);
        expect(query.code).toBe("helloworld");
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
