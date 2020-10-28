const axios = require("axios");
const { format, parse, URLSearchParams } = require("url");

const baseUrl = process.env.FAUXAUTH_URL || "http://localhost:3000";

describe("fauxauth", () => {
  beforeEach(async () => {
    const { statusCode } = await makeRequest("/_configuration", { method: "DELETE" });
    expect(statusCode).toBe(204);
  });

  it("works with default configuration", async () => {
    const state = "testing";

    let res = await makeRequest("/authorize", {
      followRedirect: false,
      qs: { client_id: "1ae9b0ca17e754106b51", state }
    });
    expect(res.statusCode).toBe(302);
    const { query, search, ...url } = parse(res.headers.location, true);
    expect(format(url)).toBe("http://example.org/");
    expect(query.state).toBe(state);
    expect(query.code).toMatch(/[0-9a-f]{20}/);

    res = await makeRequest("/access_token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: "1ae9b0ca17e754106b51",
        client_secret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
        code: query.code,
        state
      }).toString()
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatch(/access_token=[0-9a-f]{40}/);
  });

  it("works with custom configuration", async () => {
    const code = "deadbeef";
    const token = "somereallylongtoken";
    let res = await makeRequest("/_configuration", {
      body: [
        {
          op: "add",
          path: "/codes/-",
          value: code
        },
        { op: "replace", path: "/clientSecret", value: "notsosecret" },
        { op: "add", path: "/accessToken", value: token }
      ],
      json: true,
      method: "PATCH"
    });
    expect(res.statusCode).toBe(200);

    res = await makeRequest("/access_token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: "1ae9b0ca17e754106b51",
        client_secret: "notsosecret",
        code
      }).toString()
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain(`access_token=${token}`);
  });
});

const makeRequest = (url, options) => axios
  .request({
    baseURL: baseUrl,
    data: options.body,
    method: options.method,
    params: options.qs,
    maxRedirects: options.followRedirect !== false ? 5 : 0,
    url
  })
  .catch(error => error.response)
  .then(({ data, headers, status }) => ({
    body: data,
    headers,
    statusCode: status
  }));
