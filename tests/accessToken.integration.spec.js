import qs from "querystring";
import request from "supertest";
import { parse } from "url";
import { parseString } from "xml2js";

import appFactory from "../src/app";

describe("access_token endpoint", () => {
  let code;

  const configuration = {
    clientId: "your-name-here",
    clientSecret: "squirrel",
    codes: [],
  };
  const app = appFactory(configuration);
  const endpoint = "/access_token";

  beforeEach(async () => {
    await request(app)
      .get("/authorize")
      .query({
        client_id: configuration.clientId,
        client_secret: configuration.clientSecret,
      })
      .expect(302)
      .then((res) => {
        const { query } = parse(res.get("Location"), true);
        code = query.code;
      });
  });

  it("returns an access token", () => {
    return request(app)
      .post(endpoint)
      .query({
        client_id: configuration.clientId,
        client_secret: configuration.clientSecret,
        code,
      })
      .expect(200)
      .then((res) => {
        const content = qs.parse(res.text);
        expect(content.access_token).toMatch(/[0-9a-f]{40}/);
        expect(content.token_type).toBe("bearer");
      });
  });

  it("rejects unrecognised codes", () => {
    return request(app)
      .post(endpoint)
      .query({
        client_id: configuration.clientId,
        client_secret: configuration.clientSecret,
        code: "badcode",
      })
      .accept("json")
      .expect(200)
      .then((res) => {
        expect(res.body.error).toBe("bad_verification_code");
      });
  });

  it("rejects already-used codes", async () => {
    await request(app)
      .post(endpoint)
      .query({
        client_id: configuration.clientId,
        client_secret: configuration.clientSecret,
        code,
      })
      .accept("json")
      .expect(200)
      .then((res) => {
        expect(res.body.error).toBeUndefined();
      });

    await request(app)
      .post(endpoint)
      .query({
        client_id: configuration.clientId,
        client_secret: configuration.clientSecret,
        code,
      })
      .accept("json")
      .expect(200)
      .then((res) => {
        expect(res.body.error).toBe("bad_verification_code");
      });
  });

  it("rejects unknown clients", () => {
    return request(app)
      .post(endpoint)
      .query({
        client_id: "something",
      })
      .expect(404);
  });

  it("provides error details on invalid credentials", () => {
    return request(app)
      .post(endpoint)
      .query({
        client_id: configuration.clientId,
        client_secret: "everyoneknowsthis",
      })
      .accept("json")
      .expect(200)
      .then((res) => {
        expect(res.body.error).toBe("incorrect_client_credentials");
      });
  });

  describe("accept types", () => {
    const query = {
      client_id: configuration.clientId,
      client_secret: configuration.clientSecret,
    };

    it("handles application/json", () => {
      return request(app)
        .post(endpoint)
        .query({ ...query, code })
        .accept("json")
        .expect(200)
        .then((res) => {
          expect(res.body.access_token).toMatch(/[0-9a-f]{40}/);
          expect(res.body.token_type).toBe("bearer");
        });
    });

    it("handles application/xml", () => {
      return request(app)
        .post(endpoint)
        .query({ ...query, code })
        .accept("application/xml")
        .expect("Content-Type", /application\/xml/)
        .then((res) => parseXml(res.text))
        .then((body) => {
          expect(body.OAuth.access_token).toMatch(/[0-9a-f]{40}/);
          expect(body.OAuth.token_type).toBe("bearer");
        });
    });

    function parseXml(text) {
      return new Promise((resolve, reject) => {
        parseString(text, { explicitArray: false }, (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        });
      });
    }
  });
});
