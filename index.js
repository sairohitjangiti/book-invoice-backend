import express from "express";
import { MongoClient } from "mongodb";
import { userRouter } from "./routes/users.js";
import { usercustomerRouter } from "./routes/usercustomer.js";
import { invoiceRouter } from "./routes/invoices.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

async function CreateConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("MONGODB is Connected");
  return client;
}
export const client = await CreateConnection();

app.listen(PORT, () => console.log("PORT is connected in:", PORT));

app.get("/", (req, res) => {
  res.send({ Msg: "Server is up and start running" });
});

app.use("/users", userRouter);
app.use("/usercustomer", usercustomerRouter);
app.use("/invoices", invoiceRouter);
