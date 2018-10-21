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

  describe("access_token endpoint", () => {
    const endpoint = "/access_token";

    it("returns an access token", () => {
      return request(app)
        .post(endpoint)
        .query({
          code: "helloworld",
          client_id: "yourid",
          client_secret: "yoursecret",
        })
        .expect(
          200,
          "access_token=e72e16c7e42f292c6912e7710c838347ae178b4a&token_type=bearer"
        );
    });

    describe("accept types", () => {
      const query = {
        code: "helloworld",
        client_id: "yourid",
        client_secret: "yoursecret",
      };

      it("handles application/json", () => {
        return request(app)
          .post(endpoint)
          .query(query)
          .accept("json")
          .expect(200, {
            access_token: "e72e16c7e42f292c6912e7710c838347ae178b4a",
            token_type: "bearer",
          });
      });
    });
  });
});
