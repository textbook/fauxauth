import request from "supertest";

import appFactory from "../src/app";

describe("_configure endpoint", () => {
  const endpoint = "/_configuration";
  const clientId = "your-name-here";
  const clientSecret = "sshhh";

  const app = appFactory({ clientId, clientSecret });

  it("exposes current configuration", () => {
    return request(app)
      .get(endpoint)
      .expect(200, { clientId, clientSecret });
  });

  it("allows overriding initial configuration", async () => {
    const newClientId = "something-else";

    await request(app)
      .get(`/authorize?client_id=${clientId}`)
      .expect(302);

    await request(app)
      .patch(endpoint)
      .send([{ op: "replace", path: "/clientId", value: "something-else" }])
      .expect(200, { clientId: newClientId, clientSecret });

    await request(app)
      .get(`/authorize?client_id=${clientId}`)
      .expect(404);
  });
});
