const express = require("express");

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// const cors = require("cors");
const Speakeasy = require("speakeasy");

const User = require("./models/UserModel");
const Session = require("./models/SessionModel");

mongoose.connect(
  "mongodb+srv://katcy:Neesama@143@katcy.jlmvn.mongodb.net/MFA?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const app = express();

//app.use(cors());
app.use(express.json());

app.post("/signin", (req, res) => {
  const { username, pwd } = req.body;
  User.findOne({ username: username })
    .then((user) => {
      const isSame = bcrypt.compare(pwd, user.password);
      if (isSame) {
        if (user.totpVerified) {
          res.status(200).json({ message: "verified" });
        } else {
          res
            .status(200)
            .json({ message: "TOTP pending", access: user.totpUrl });
        }
      } else {
        res.send(403);
      }
    })
    .catch(() => {
      res.send(404);
    });
});

app.post("/register", (req, res) => {
  const { username, pwd } = req.body;
  const totpKey = Speakeasy.generateSecret({
    issuer: "dudesandtools",
    name: username,
  });
  console.log(totpKey);
  bcrypt
    .hash(pwd, 10)
    .then((pwd) => {
      const newUser = new User({
        username: username,
        password: pwd,
        totpKey: totpKey.base32,
        totpUrl: totpKey.otpauth_url,
        totpVerified: false,
      });

      newUser.save().then(() => {
        res
          .status(201)
          .json({ message: "Welcome Onboard", accessKey: totpKey.otpauth_url });
      });
    })
    .catch((err) => {
      res.status(400).json({ message: "oops" });
    });
});

app.post("/verify", (req, res) => {
  const { username, code } = req.body;
  User.findOne({ username: username })
    .then((user) => {
      const isValid = Speakeasy.totp.verify({
        secret: user.totpKey,
        encoding: "base32",
        token: code,
      });
      //   console.clear();
      //   console.log(user);
      //   console.log(isValid);
      if (isValid) {
        user
          .update({ totpVerified: true })
          .then(() => {
            const session = new Session({
              username: user.name,
            });
            session
              .save()
              .then((sessionId) => {
                res.status(201).json(sessionId);
              })
              .catch((err) => {
                res.send(500);
              });
          })
          .catch();
      } else {
        res.send(403);
      }
    })
    .catch((err) => {
      res.send(404);
    });
});

app.listen(5000, () => {
  console.log("server started at 5000");
});
