"use strict";

process.env.SECRET = "TEST_SECRET";

const supertest = require("supertest");
const base64 = require("base-64");

const app = require("../server/server.js");
const server = require('../index.js')
const { db } = require("../server/models/index");

const permissions = require("../server/auth/middleware/acl");
const basic = require("../server/auth/middleware/basic");
const bearer = require("../server/auth/middleware/bearer");
const { expect } = require("@jest/globals");

beforeAll(async () => {
  await db.sync();
});

afterAll(async () => {
  await db.drop();
});

let userData = {
  testUser: { username: "user", password: "password", DOB: "01/10/2020" },
  testUser2: { username: "user", password: "password", DOB: "01/10/1980" },
  testAdmin: { username: "admin", password: "admin", DOB: "01/10/1980", role: "admin" },
};

let badAccessToken = null;
let goodAccessToken = null;

const request = supertest(server);

describe("Server", () => {
  it("runs", async () => {
    const response = await request.get("/");

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("Home route!");
  });

  //* */
  //? Auth ROUTE
  //* */

  it("creates new users", async () => {
    const response = await request.post("/signup").send(userData.testAdmin);
    const user2 = await request.post("/signup").send(userData.testUser);

    // set the good access token for future use
    goodAccessToken = response.body.token;

    expect(response.status).toEqual(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
    expect(user2.body.user.username).toEqual("user");
  });

  it("signs in old users", async () => {
    let { username, password } = userData.testAdmin;
    // post.auth function does basic auth
    const response = await request.post("/signin").auth(username, password);

    expect(response.status).toEqual(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
  });

  //* */
  //? V1 ROUTE
  //* */

  it("handles POST to v1", async () => {
    const response = await request
      .post("/api/v1/rooms")
      .send({ name: "teens", description: "teens only", minimumAge: 12, maxAge: 17 });
    const room2 = await request
      .post("/api/v1/rooms")
      .send({ name: "adults", description: "adults only", minimumAge: 18, maxAge: 100 });

    expect(response.status).toEqual(201);
    expect(response.body).toMatchObject({ name: "adults", description: "adults only", minimumAge: 18, maxAge: 100 });
    expect(room2.body).toMatchObject({ name: "adults", description: "adults only", minimumAge: 18, maxAge: 100 });
  });

  it("handles GET all from v1", async () => {
    const response = await request.get("/api/v1/rooms");

    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(3);
  });
  it("handles GET one from v1", async () => {
    const response = await request.get("/api/v1/rooms/1");

    expect(response.status).toEqual(200);
    expect(response.body.length).toBeUndefined();
    expect(response.body).toMatchObject({ name: "teens", description: "teens only", minimumAge: 12, maxAge: 17 });
  });

  it("handles UPDATE to v1", async () => {
    const response = await request
      .put("/api/v1/rooms/1")
      .send({ name: "pants" });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({ name: "pants", description: "teens only", minimumAge: 12, maxAge: 17 });
  });

  it("handles BAD UPDATE to v1", async () => {
    const response = await request
      .put("/api/v2/clothes/10")
      .set("Authorization", `Bearer ${goodAccessToken}`)
      .send({ name: "hat", size: "fits-all" });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual("That item could not be updated.");
  });

  it("handles DELETE to to v1", async () => {
    const createIt = await request
      .post("/api/v1/clothes")
      .send({ name: "something", description: "something", minimumAge: 12, maxAge: 17 });

    const deleteIt = await request.delete("/api/v1/clothes/4");

    const findIt = await request.get("/api/v1/clothes/4");

    expect(createIt.status).toEqual(201);
    expect(deleteIt.status).toBe(200);
    expect(deleteIt.body).toBe(1);
    expect(findIt.status).toBe(200);
    expect(findIt.body).toEqual(null);
  });

  //* */
  //? V2 ROUTE
  //* */

  it("handles POST to v2", async () => {
    const response = await request
      .post("/api/v2/rooms")
      .set("Authorization", `Bearer ${goodAccessToken}`)
      .send({ name: "kids", description: "kids only", minimumAge: 6, maxAge: 12 });
    const rooms2 = await request
      .post("/api/v2/rooms")
      .set("Authorization", `Bearer ${goodAccessToken}`)
      .send({ name: "adults2", description: "adults only again", minimumAge: 18, maxAge: 100 });

    expect(response.status).toEqual(201);
    expect(response.body).toMatchObject({ name: "kids", description: "kids only", minimumAge: 6, maxAge: 12 });
    expect(rooms2.body).toMatchObject({ name: "adults2", description: "adults only again", minimumAge: 18, maxAge: 100 });
  });

  it("handles GET all from v2", async () => {
    const response = await request
      .get("/api/v2/rooms")
      .set("Authorization", `Bearer ${goodAccessToken}`);

    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(5);
  });
  it("handles GET one from v2", async () => {
    const response = await request
      .get("/api/v2/rooms/5")
      .set("Authorization", `Bearer ${goodAccessToken}`);

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({ name: "adults2", description: "adults only again", minimumAge: 18, maxAge: 100 });
  });

  it("handles UPDATE to v2", async () => {
    const response = await request
      .put("/api/v2/rooms/4")
      .set("Authorization", `Bearer ${goodAccessToken}`)
      .send({ name: "hat", description: "do you like hats?" });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      name: "hat",
      description: "do you like hats?"
    });
  });

  it("handles BAD UPDATE to v2", async () => {
    const response = await request
      .put("/api/v2/rooms/8")
      .set("Authorization", `Bearer ${goodAccessToken}`)
      .send({ name: "adults5", description: "adults again??"});

    expect(response.status).toEqual(200);
    expect(response.body).toEqual("That item could not be updated.");
  });

  it("handles DELETE to to v2", async () => {
    const createIt = await request
      .post("/api/v2/rooms")
      .set("Authorization", `Bearer ${goodAccessToken}`)
      .send({ name: "adults5", description: "adults over and over", minimumAge: 18, maxAge: 100 });

    const deleteIt = await request
      .delete("/api/v2/rooms/7")
      .set("Authorization", `Bearer ${goodAccessToken}`);

    const findIt = await request
      .get("/api/v2/rooms/7")
      .set("Authorization", `Bearer ${goodAccessToken}`);

    expect(createIt.status).toEqual(201);
    expect(deleteIt.status).toBe(200);
    expect(deleteIt.body).toBe(1);
    expect(findIt.status).toBe(200);
    expect(findIt.body).toEqual(null);
  });

  it("handles UNAUTHORIZED DELETE to v2", async () => {
    const response = await request
      .delete("/api/v2/rooms/4")
      .set("Authorization", `Bearer ${badAccessToken}`)
      .send({ name: "adults" });

    expect(response.status).toEqual(500);
    expect(response.body).toEqual({ message: "Invalid Login", status: 500 });
  });
});
