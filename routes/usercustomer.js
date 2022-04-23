import express from "express";
const router = express.Router();
import {
  Getcustomer,
  Createcustomer,
  Getuser,
  Deletecustomer,
  getCustomer,
  updateCustomer,
} from "../helperfunction.js";
import { client } from "../index.js";

router.route("/createcustomer").post(async (req, res) => {
  const { Username, customerName, email, phoneno, address } = req.body;
  const userdata = await Getcustomer(
    customerName ? { customerName: customerName } : { email: email }
  );
  if (userdata) {
    return res.status(401).send({ msg: "customer already exist" });
  }
  const customer = await Createcustomer({
    Username,
    customerName,
    email,
    phoneno,
    address,
  });
  res.status(200).send({ msg: "Customer added successfully" });
});

router.route("/customerlist").get(async (req, res) => {
  const token = req.header("x-auth-token");
  const user = await Getuser({ token: token });
  // console.log(user);
  const { Username } = user;
  const customers = await client
    .db("bookkeeping")
    .collection("customers")
    .find({ Username: Username })
    .toArray();
  res.send(customers);
});

router.route("/:id").delete(async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  const customer = await Deletecustomer(id);
  res.send({ customer, msg: "customer deleted successfully" });
});

router.route("/:id").get(async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  const customer = await getCustomer(id);
  // console.log(customer);
  res.send(customer);
});

router.route("/:id").put(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const customer = await updateCustomer(id, data);
  res.send(customer);
});

export const usercustomerRouter = router;
