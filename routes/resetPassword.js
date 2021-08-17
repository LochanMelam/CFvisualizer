const express = require("express");
const router = express.Router();
const model = require("../models/user");

router.get("/:id", (req, res) => {
  model.find({ _id: req.params.id }, (error, response) => {
    if (error) console.log("error");
    if (response.length != 0) {
      res.render("resetPassword");
    } else {
      res.redirect("/signin");
    }
  });
});
router.post("/:id", (req, res) => {
  model.updateOne(
    { _id: req.params.id },
    { $set: { password: req.body.password } },
    (error, response) => {
      if (error) console.log(error);
      res.render("resetPassword", { prompt: "password reset successfull" });
    }
  );
});

module.exports = router;
