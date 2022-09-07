const express = require("express");
const router = express.Router();
const { Customer, validateCustomer } = require("../model/customerModel");
const { getAuthMiddleware } = require("../middleware/auth");
const { getAdminMiddleware } = require("../middleware/admin");
const { validateObjectId } = require("../middleware/validateObjectId");

// GET all customers

router.get("/", async (req, res, next) => {
  const customers = await Customer.find({});
  if (customers && customers.length === 0)
    return res.status(404).send("Customer could not be found..");
  res.status(200).send(customers);
});

// GET specific customer by ID:

router.get("/:id", validateObjectId, async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).send("Customer could not be found...");
  res.status(200).send(customer);
});

//CREATE Customer:

router.post("/", getAuthMiddleware, async (req, res, next) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  });
  await customer.save();
  res.status(200).send(customer);
});

// UPDATE customer.

router.put(
  "/:id",
  getAuthMiddleware,
  getAdminMiddleware,
  validateObjectId,
  async (req, res, next) => {
    const { error } = validateCustomer(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          isGold: req.body.isGold,
        },
      },
      { new: true, runValidators: true }
    );
    if (!customer)
      return res
        .status(404)
        .send("customer with given id could not be found...!");
    res.status(200).send(customer);
  }
);

// DELETE customer.

router.delete(
  "/:id",
  getAuthMiddleware,
  getAdminMiddleware,
  validateObjectId,
  async (req, res, next) => {
    const customer = await Customer.findByIdAndDelete({ _id: req.params.id });
    if (!customer)
      return res.status(404).send("customer could not be found...!");
    return res.status(200).send(customer);
  }
);

module.exports = router;
