import request from "supertest";

import appFactory from "../src/app";

describe("authorize endpoint", () => {
  const endpoint = "/authorize";
  const clientId = "your-name-here";
  const app = appFactory({ clientId });

  it("redirects you back to the specified location", () => {
    const redirectUri = "http://example.org";

    return request(app)
      .get(endpoint)
      .query({ client_id: clientId, redirect_uri: redirectUri })
      .expect(302)
      .expect("Location", new RegExp(`^${redirectUri}`));
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
      .expect("Location", new RegExp(`state=${state}`));
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
      .expect("Location", /code=helloworld/);
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
