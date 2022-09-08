const mongoose = require("mongoose");
const app = require("../../../index");
const supertest = require("supertest");
const req = supertest(app);
const { Customer } = require("../../../model/customerModel");
const { User } = require("../../../model/usersModel");

describe("/api/customers/", () => {
  afterEach(async () => {
    await Customer.deleteMany({});
  });

  describe("/ GET", () => {
    it("should return all the customers from the database", async () => {
      await Customer.collection.insertMany([
        {
          name: "Sidhesh",
          phone: "9594031927",
          isGold: "true",
        },
        {
          name: "Shubham",
          phone: "9594055527",
          isGold: "false",
        },
      ]);
      const res = await req.get("/api/customers/");
      expect(res.status).toBe(200);
      expect(res.body.some((c) => c.name === "Sidhesh")).toBeTruthy();
      expect(res.body.some((c) => c.name === "Shubham")).toBeTruthy();
    });

    it("should return 404 if customers not found", async () => {
      const res = await req.get("/api/customers");
      expect(res.status).toBe(404);
    });
  });

  describe("/:id GET", () => {
    it("should get 400 if id is invalid", async () => {
      const res = await req.get("/api/customers/" + 23);
      expect(res.status).toBe(400);
    });

    it("should return 404 if not found a customer with the given ID", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/api/customers/" + id);
      expect(res.status).toBe(404);
    });

    it("should return the Customer with the given id with status 200", async () => {
      const customer = new Customer({
        name: "Sidhesh",
        phone: "9594031927",
        isGold: true,
      });
      await customer.save();
      const res = await req.get("/api/customers/" + customer._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Sidhesh");
      expect(res.body).toHaveProperty("phone", "9594031927");
      expect(res.body).toHaveProperty("isGold", true);
    });
  });

  describe("/ POST", () => {
    it("should return 401 if not a valid user", async () => {
      const res = await req.post("/api/customers/");
      expect(res.status).toBe(401);
    });

    // test cases for all the customer properties like name, phone, isGold

    // customer.name
    it("should return 400 if customer name is less than 5 characters", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/api/customers/")
        .set("x-auth-token", token)
        .send({ name: "as" });
    });

    it("should return 400 if customer name is more than 50 characters", async () => {
      const token = new User().getAuthToken();
      const name = new Array(54).join("a");
      const res = await req
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({ name, phone: "4848581294" });
      expect(res.status).toBe(400);
    });

    //customer.phone
    it("should return 400 if customer phone is less than 7 characters", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/api/customers/")
        .set("x-auth-token", token)
        .send({ name: "Sidhesh", phone: "26723" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer phone is more than 10 characters", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/api/customers/")
        .set("x-auth-token", token)
        .send({ name: "Sidhesh", phone: "23894723984723" });
      expect(res.status).toBe(400);
    });

    it("should return 200 if customer is saved", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/api/customers/")
        .set("x-auth-token", token)
        .send({ name: "Sidhesh", phone: "5678909870" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Sidhesh");
      expect(res.body).toHaveProperty("phone", "5678909870");
      expect(res.body).toHaveProperty("isGold", false);
    });
  });

  describe("/:id PUT", () => {
    it("should return 401 if token is invalid", async () => {
      const res = await req.put("/api/customers/" + 23);

      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an Admin", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .put("/api/customers/" + 23)
        .set("x-auth-token", token);

      expect(res.status).toBe(403);
    });

    it("should return 400 if id is invalid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      const res = await req
        .put("/api/customers/" + 34)
        .set("x-auth-token", token);

      expect(res.status).toBe(400);
    });
    // customer.name
    it("should return 400 if customer name is less than 5 characters", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      await Customer.collection.insertOne({
        name: "Sidhesh",
        phone: "4567890988",
      });
      const customer = await Customer.findOne({ name: "Sidhesh" });

      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name: "as", phone: "2343243455", isGold: true });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer name is more than 50 characters", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const name = new Array(54).join("a");
      await Customer.collection.insertOne({
        name: "Sidhesh",
        phone: "4567890988",
      });

      const customer = await Customer.findOne({ name: "Sidhesh" });
      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name, phone: "4848581294", isGold: true });
      expect(res.status).toBe(400);
    });

    //customer.phone
    it("should return 400 if customer phone is less than 7 characters", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      await Customer.collection.insertOne({
        name: "Sidhesh",
        phone: "4567890988",
      });
      const customer = await Customer.findOne({ name: "Sidhesh" });
      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name: "Sidhesh", phone: "26723", isGold: true });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer phone is more than 10 characters", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      await Customer.collection.insertOne({
        name: "Sidhesh",
        phone: "4567890988",
      });
      const customer = await Customer.findOne({ name: "Sidhesh" });
      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name: "Sidhesh", phone: "23894723984723", isGold: false });
      expect(res.status).toBe(400);
    });

    it("should return 404 if customer with the given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId();

      await Customer.collection.insertMany([
        { name: "Sidhesh", phone: "9594031927", isGold: true },
        { name: "Nikhil", phone: "9598031929" },
      ]);

      const res = await req
        .put("/api/customers/" + id)
        .set("x-auth-token", token)
        .send({ name: "Sidhesh", phone: "9594031893", isGold: false });

      expect(res.status).toBe(404);
    });

    it("should return 200 if given id with the customer is saved ", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      await Customer.collection.insertMany([
        { name: "Sidhesh", phone: "9594031927", isGold: true },
        { name: "Nikhil", phone: "9598031929" },
      ]);
      const customer = await Customer.findOne({ name: "Sidhesh" });

      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name: "Sidhesh", phone: "9594031893", isGold: false });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Sidhesh");
      expect(res.body).toHaveProperty("phone", "9594031893");
      expect(res.body).toHaveProperty("isGold", false);
    });
  });

  describe("/:id DELETE", () => {
    it("should return 401 if invalid token provided", async () => {
      const res = await req.delete("/api/customers/" + 12);
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an Admin", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .delete("/api/customers/" + 12)
        .set("x-auth-token", token);

      expect(res.status).toBe(403);
    });

    it("should return 400 if id is invalid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req
        .delete("/api/customers/" + 32)
        .set("x-auth-token", token);

      expect(res.status).toBe(400);
    });

    it("should return 404 if customer with the given id not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId();
      await Customer.collection.insertOne({
        name: "Sidhesh",
        phone: "8765498706",
        isGold: true,
      });

      const res = await req
        .delete("/api/customers/" + id)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 200 if customer with given id is deleted", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      await Customer.collection.insertOne({
        name: "Sidhesh",
        phone: "8765498706",
        isGold: true,
      });
      const customer = await Customer.findOne({ name: "Sidhesh" });

      const res = await req
        .delete("/api/customers/" + customer._id)
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Sidhesh");
      expect(res.body).toHaveProperty("phone", "8765498706");
      expect(res.body).toHaveProperty("isGold", true);
    });
  });
});
