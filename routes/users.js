import {
  Getuser,
  Createuser,
  genpassword,
  updateUser,
  updatePass,
} from "../helperfunction.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth.js";
import bcrypt from "bcrypt";
import express from "express";
const router = express.Router();
import { client } from "../index.js";

router.route("/signup").post(async (req, res) => {
  const { Firstname, Lastname, Username, email, Password } = req.body;

  const userdata = await Getuser(
    Username ? { Username: Username } : { email: email }
  );
  if (userdata) {
    return res.status(401).send({ message: "credentials already exists" });
  }

  const hashedPassword = await genpassword(Password);
  const user = await Createuser({
    Firstname,
    Lastname,
    Username,
    email,
    Password: hashedPassword,
  });

  const userfromDB = await Getuser({ Username: Username });
  const token = jwt.sign({ id: userfromDB._id }, process.env.secret_key);
  // console.log(token);
  const user1 = await updateUser({
    Username: userfromDB.Username,
    token: token,
  });

  res.status(200).send({ Msg: "Signup successfully" });
});

router.route("/login").post(async (req, res) => {
  const { email, password } = req.body;
  const userfromDB = await Getuser({ email: email });
  if (!userfromDB) {
    res.status(401).send({ message: "Invalid Credentials" });
    return;
  }
  const storedPassword = userfromDB.Password;
  const ispasswordmatch = await bcrypt.compare(password, storedPassword);
  if (ispasswordmatch) {
    res.status(200).send(userfromDB);
  } else {
    res.status(401).send({ message: "Invalid Credentials" });
  }
});

router.route("/forgotpassword").post(async (req, res) => {
  const { email } = req.body;

  const userfromDB = await Getuser({ email: email });
  // console.log(userfromDB);
  if (!userfromDB) {
    // console.error("Mail not registered");
    res.status(403).send({ Msg: "Mail is not registered" });
    return;
  }
  const token = userfromDB.token;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.my_gmail}`,
      pass: `${process.env.my_pass}`,
    },
  });

  const link = `https://book-invoice.netlify.app/forgotpassword/verify/${token}`;
  // const link = `http://localhost:3000/forgotpassword/verify/${token}`;
  const mailoptions = {
    from: "userbase@gmail.com",
    to: email,
    subject: "Link to reset password",
    html: `<h1>Hello ${userfromDB.Firstname}</h1>
      <p>You are requested to change password</p>
      <p>Please click on the following link or paste this in your browser to complete the process of reset password</p>
        <a href=${link} target=_parent>Click to reset password</a>
        <p>Automatically it redirected you to resetpassword page</p>`,
  };

  transporter.sendMail(mailoptions, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent: " + res.response);
    }
  });
  res.status(200).send({ Msg: "recovery mail sent" });
});

router.route("/forgotpassword/verify").get(auth, async (req, res) => {
  return res.status(200).send({ Message: "token matched" });
});

router.route("/resetpassword").post(async (req, res) => {
  const { password, token } = req.body;
  // console.log(token);
  const data = await Getuser({ token: token });
  // console.log(data);
  // the data is not there in the DB return an error msg
  if (!data) {
    return res.status(401).send({ Message: "Invalid credentials" });
  }
  const { email } = data;
  // console.log(email);

  const hashedpassword = await genpassword(password);
  const user = await updatePass({
    email: email,
    password: hashedpassword,
  });
  const result = await Getuser({ email });
  res.send(user);
});

router.route("/edit/:id").put(async (req, res) => {
  const data = req.body;
  const user = await client
    .db("bookkeeping")
    .collection("users")
    .updateOne({ Username: data.Username }, { $set: data });
  res.send(user);
});

router.route("/getuser").get(async (req, res) => {
  const token = req.header("x-auth-token");
  const user = await Getuser({ token: token });
  res.send(user);
});

export const userRouter = router;
