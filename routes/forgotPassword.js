const express = require("express");
const router = express.Router();
const model = require("../models/user");
const nodemailer = require("nodemailer");
router.get("/", (req, res) => {
  res.render("forgotPassword");
});

router.post("/", (req, res) => {
  var email = req.body.email;

  function errorCallback(msg) {
    res.render("forgotPassword", { failed: msg });
  }
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
      subject: "Reset password for CFvisualizer",
      text: `Click on the link  to reset your password for CFvisualizer http://${req.get(
        "host"
      )}/resetPassword/${id}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("send mail error", error);
        errorCallback(
          "can't send verification email please enter a valid email"
        );
      } else {
        res.render("forgotPassword", {
          success: "An email has been sent to reset your password",
        });
      }
    });
  }
  model.find({ email: email }, (error, response) => {
    if (error) console.log(error);
    if (response.length != 0) {
      sendVerificationMail(response[0]._id);
    } else {
      errorCallback("user with email doesn't exists");
    }
  });
});

module.exports = router;
