import request from "supertest";
import { parseString } from "xml2js";

import appFactory from "../src/app";

describe("access_token endpoint", () => {
  const configuration = {
    clientId: "your-name-here",
    clientSecret: "squirrel",
  };
  const app = appFactory(configuration);
  const endpoint = "/access_token";

  it("returns an access token", () => {
    return request(app)
      .post(endpoint)
      .query({
        client_id: configuration.clientId,
        client_secret: configuration.clientSecret,
        code: "helloworld",
      })
      .expect(
        200,
        "access_token=e72e16c7e42f292c6912e7710c838347ae178b4a&token_type=bearer"
      );
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
      code: "helloworld",
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

    it("handles application/xml", () => {
      return request(app)
        .post(endpoint)
        .query(query)
        .accept("application/xml")
        .expect("Content-Type", /application\/xml/)
        .then((res) => parseXml(res.text))
        .then((body) => {
          expect(body).toEqual({
            OAuth: {
              access_token: "e72e16c7e42f292c6912e7710c838347ae178b4a",
              token_type: "bearer",
            },
          });
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
