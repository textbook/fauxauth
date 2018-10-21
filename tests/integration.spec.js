import request from "supertest";

import { app } from "../src/app";

describe("fauxauth", () => {
  describe("authorize endpoint", () => {
    const endpoint = "/authorize";

    it("redirects you back to the specified location", () => {
      const redirectUri = "http://example.org";

      return request(app)
        .get(endpoint)
        .query({ client_id: "yourid", redirect_uri: redirectUri })
        .expect(302)
        .expect("Location", new RegExp(`^${redirectUri}`));
    });

    it("includes the state if specified", () => {
      const state = "randomstate";

      return request(app)
        .get(endpoint)
        .query({
          client_id: "yourid",
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
          client_id: "yourid",
          redirect_uri: "http://example.org",
          state,
        })
        .expect(302)
        .expect("Location", /code=helloworld/);
    });
  });
});
