var express = require("express");
const user = require("../models/user");
var router = express.Router();
var model = require("../models/user");
var nodemailer = require("nodemailer");
var request = require("request");
require("dotenv").config();
//routes
router.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/stats");
  } else {
    res.render("signup");
  }
});

router.post("/", (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  //error callback
  function errorCallback(msg) {
    res.render("signup", {
      prompt: msg,
    });
  }

  //successfull callback
  function callback() {
    var user = new model({
      name: name,
      email: email,
      password: password,
      verified: false,
    });
    user.save((error, response) => {
      if (error) console.log(error);
      sendVerificationMail(response._id);
    });
  }
  // sends a verification mail to the user
  function sendVerificationMail(id) {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    var mailOptions = {
      from: "cfvisualizer@gmail.com",
      to: `${email}`,
      subject: "Account Verification for CFvisualizer",
      text: `Click on the link  to verify your email http://${req.get(
        "host"
      )}/authorize/${id}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("send mail error", error);
        errorCallback(
          "can't send verification email please enter a valid email"
        );
      } else {
        res.render("authorize");
      }
    });
  }
  // checks if user with the email already exists
  model.find({ email: email }, (error, response) => {
    if (error) console.log(error);
    try {
      // if user with email doesn't exists, creates a new user account and sends verification mail
      if (response.length == 0) {
        {
          callback();
        }
      }
      // if email already used then prompts the client, "email in use"
      else {
        errorCallback("email already in use");
      }
    } catch (error) {
      console.log(error);
      errorCallback("email already in use");
    }
  });
});

module.exports = router;
