var express = require("express");
const user = require("../models/user");
var router = express.Router();
var model = require("../models/user");
var nodemailer = require("nodemailer");

//routes
router.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/stats");
  } else {
    res.render("signup");
  }
});

router.post("/", async (req, res) => {
  var email = req.body.email;
  // sends a verification mail to the user
  function sendVerificationMail(id) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "cfvisualizer@gmail.com",
        pass: "9848152269",
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
      if (error) console.log("send mail error", error);
      else res.render("authorize");
    });
  }
  // checks if user with the email already exists
  await model.find({ email: email }, async (error, response) => {
    if (error) console.log(error);
    try {
      // if user with email doesn't exists, creates a new user account and sends verification mail
      if (response.length == 0) {
        var user = await new model({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          verified: false,
        });
        user.save((error, response) => {
          if (error) console.log(error);
          sendVerificationMail(response._id);
        });
      }
      // if email already used then prompts the client, "email in use"
      else {
        res.render("signup", { prompt: "user with email already exists" });
      }
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
