const express = require("express");
const router = express.Router();
const userCollection = require("../models/user");
var nodemailer = require("nodemailer");
require("dotenv").config();
//routes
router.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/stats");
  } else {
    res.render("signin");
  }
});

router.post("/", async (req, res) => {
  var email = req.body.email,
    password = req.body.password;
  // sends a verification mail to the user just in case if the user mail is not verified
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
      text: `http://${req.get("host")}/authorize/${id}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("send mail error", error);
      else res.render("authorize");
    });
  }

  // checks in the database if user with the credentials exists
  userCollection.find({ email: email, password: password }, (err, user) => {
    if (err) console.log(err);
    try {
      //if user is present in database then checks whether user's email is verified or not
      if (user.length != 0) {
        // if not verified sends a verification mail
        if (!user[0].verified) {
          sendVerificationMail(userExists[0]._id);
          // if verified allows the user to access account
        } else {
          req.session.user = true;
          res.redirect("/stats");
        }
      }
      // if user with the credentials dosen't exist in db. redirects to signin page
      else {
        res.render("signin", { prompt: "invalid credintials" });
      }
    } catch (
      err // if any error exists in b/w then redirects to login
    ) {
      res.render("signin", { prompt: "oops! try again" });
    }
  });
});
module.exports = router;
