import { client } from "./index.js";
import bcrypt from "bcrypt";
import {ObjectId}  from "mongodb";

async function Getuser(values) {
  return await client.db("bookkeeping").collection("users").findOne(values);
}
async function Createuser(values) {
  return await client.db("bookkeeping").collection("users").insertOne(values);
}
async function genpassword(Password) {
  const NO_OF_ROUNDS = 10;
  const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
  const hashpassword = await bcrypt.hash(Password, salt);
  return hashpassword;
}
async function updateUser({ Username, token }) {
  await client
    .db("bookkeeping")
    .collection("users")
    .updateOne({ Username: Username }, { $set: { token: token } });
}
async function updatePass({ email: email, password: hashedpassword }) {
  await client
    .db("bookkeeping")
    .collection("users")
    .updateOne({ email: email }, { $set: { Password: hashedpassword } });
}

export { Getuser, Createuser, genpassword, updateUser, updatePass };

async function Getcustomer(values) {
  return await client .db("bookkeeping").collection("customers").findOne(values);
}
async function Createcustomer(values) {
  return await client
    .db("bookkeeping")
    .collection("customers")
    .insertOne(values);
}
async function Deletecustomer(id){
  return await client
   .db("bookkeeping")
   .collection("customers")
   .deleteOne({_id : ObjectId(id)})
}
async function getCustomer(id){
   return await client
   .db("bookkeeping")
   .collection("customers")
   .findOne({_id : ObjectId(id)})
}
async function updateCustomer(id,data){
  return await client
   .db("bookkeeping")
   .collection("customers")
   .updateOne({ _id: ObjectId(id) }, { $set: data })
}

export { Getcustomer, Createcustomer,Deletecustomer,getCustomer,updateCustomer };
