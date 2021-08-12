const express = require("express");
var router = express.Router();
var model = require("../models/user");

//get route
router.get("/:id", (req, res) => {
  model.updateOne(
    { _id: req.params.id },
    { $set: { verified: true } },
    (err, user) => {
      console.log(user);
      if (err) {
        console.log(err);
      } else {
        res.redirect("/signin");
      }
    }
  );
});

//post route
router.post("/", async (req, res) => {});
module.exports = router;
