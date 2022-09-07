const supertest = require("supertest");
const app = require("../../../index");
const { Genre } = require("../../../model/genresModel");
const req = supertest(app);
const { User } = require("../../../model/usersModel");

describe("getAuthMiddlware", () => {
  afterEach(async () => {
    await Genre.remove();
  });
  it("should return 401 if token not provided", async () => {
    const res = await req.post("/api/genres/").send({ name: "Drama" });
    expect(res.status).toBe(401);
  });
  it("should return 400 if token is invalid", async () => {
    const res = await req
      .post("/api/genres/")
      .set("x-auth-token", "asbcdefg")
      .send({ name: "Drama" });
    expect(res.status).toBe(400);
  });
  it("should return 200 if token is valid", async () => {
    const token = new User().getAuthToken();
    const res = await req
      .post("/api/genres/")
      .set("x-auth-token", token)
      .send({ name: "Drama" });
    expect(res.status).toBe(200);
  });
});
