const express = require("express");
const router = express.Router();
const userCollection = require("../models/user");
var nodemailer = require("nodemailer");

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
      text: `http://${req.get("host")}/authorize/${id}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("send mail error", error);
      else res.render("authorize");
    });
  }

  // checks in the database if user with the credentials exists
  var userExists = await userCollection.find(
    { email: email, password: password },
    (err, user) => {
      if (err) console.log(err);
      else {
        console.log("user exists in our records ");
        console.log("input details", user);
      }
    }
  );
  //if user is present in database then checks whether user's email is verified or not
  if (userExists.length != 0) {
    // if not verified sends a verification mail
    if (!userExists[0].verified) {
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
});
module.exports = router;
