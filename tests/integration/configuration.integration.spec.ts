import { Application } from "express";
import request from "supertest";

import appFactory from "../../src/app";
import { Configuration, generateConfiguration } from "../../src/utils";

describe("_configure endpoint", () => {
  const endpoint = "/_configuration";

  let app: Application;
  let initialConfig: Configuration;

  beforeEach(() => {
    initialConfig = generateConfiguration();
    app = appFactory(initialConfig);
  });

  it("exposes current configuration", () => {
    return request(app)
      .get(endpoint)
      .expect(200, initialConfig);
  });

  it("allows overriding initial configuration", async () => {
    const oldClientId = initialConfig.clientId;
    const newClientId = "something-else";

    await request(app)
      .get("/authorize")
      .query({ client_id: oldClientId })
      .expect(302);

    await request(app)
      .patch(endpoint)
      .send([{ op: "replace", path: "/clientId", value: newClientId }])
      .expect(200, { ...initialConfig, clientId: newClientId });

    await request(app)
      .get("/authorize")
      .query({ client_id: oldClientId })
      .expect(404);
  });

  it("allows adding codes directly", async () => {
    const code = "somenewcode";
    await request(app)
      .patch(endpoint)
      .send([{ op: "add", path: "/codes/-", value: code }])
      .expect(200, { ...initialConfig, codes: [code] });

    await request(app)
      .post("/access_token")
      .query({
        client_id: initialConfig.clientId,
        client_secret: initialConfig.clientSecret,
        code,
      })
      .expect(200);
  });

  it("allows returning to default configuration", async () => {
    await request(app)
      .patch(endpoint)
      .send([
        { op: "add", path: "/accessToken", value: "helloworld" },
        { op: "add", path: "/codes/-", value: "foobar" },
      ])
      .expect(200);

    await request(app)
      .delete(endpoint)
      .expect(204);

    await request(app)
      .get(endpoint)
      .expect(200, generateConfiguration());
  });

  it("allows setting a specific access token", async () => {
    const accessToken = "helloworld";
    const code = "itsasecret";
    initialConfig.codes.push(code);
    await request(app)
      .patch(endpoint)
      .send([{ op: "add", path: "/accessToken", value: accessToken }])
      .expect(200, { ...initialConfig, accessToken });

    return request(app)
      .post("/access_token")
      .query({
        client_id: initialConfig.clientId,
        client_secret: initialConfig.clientSecret,
        code,
      })
      .accept("json")
      .expect(200)
      .then((res) => {
        expect(res.body.access_token).toBe(accessToken);
      });
  });
});
