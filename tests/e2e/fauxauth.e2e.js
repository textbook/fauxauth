import request from "request";
import { parse, format } from "url";

const baseUrl = process.env.FAUXAUTH_URL || "http://localhost:3000";

describe("fauxauth", () => {
  beforeEach(async () => {
    await makeRequest("/_configuration", { method: "DELETE" }).then((res) => {
      expect(res.statusCode).toBe(204);
    });
  });

  it("works with default configuration", async () => {
    const state = "testing";

    await makeRequest("/authorize", {
      followRedirect: false,
      qs: { client_id: "1ae9b0ca17e754106b51", state },
    })
      .then((res) => {
        expect(res.statusCode).toBe(302);
        const { query, search, ...url } = parse(res.headers.location, true);
        expect(format(url)).toBe("http://example.org/");
        expect(query.state).toBe(state);
        expect(query.code).toMatch(/[0-9a-f]{20}/);
        return query.code;
      })
      .then((code) =>
        makeRequest("/access_token", {
          method: "POST",
          qs: {
            client_id: "1ae9b0ca17e754106b51",
            client_secret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
            code,
            state,
          },
        })
      )
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatch(/access_token=[0-9a-f]{40}/);
      });
  });

  it("works with custom configuration", async () => {
    const code = "deadbeef";
    const token = "somereallylongtoken";
    await makeRequest("/_configuration", {
      method: "PATCH",
      json: true,
      body: [
        {
          op: "add",
          path: "/codes/-",
          value: code,
        },
        { op: "replace", path: "/clientSecret", value: "notsosecret" },
        { op: "add", path: "/accessToken", value: token },
      ],
    })
      .then((res) => {
        expect(res.statusCode).toBe(200);
        return makeRequest("/access_token", {
          method: "POST",
          qs: {
            client_id: "1ae9b0ca17e754106b51",
            client_secret: "notsosecret",
            code,
          },
        });
      })
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toContain(`access_token=${token}`);
      });
  });
});

const makeRequest = (url, options) => {
  return new Promise((resolve, reject) => {
    request(
      {
        ...options,
        uri: `${baseUrl}${url}`,
      },
      (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      }
    );
  });
};