const express = require("express");
const router = express.Router();
const request = require("request");

// validate function
function validate(req, res, next) {
  if (!req.session.user) {
    console.log("not validated");
    res.redirect("/signin");
    return;
  }
  next();
}

//routes
router.get("/", validate, (req, res) => {
  res.render("suggestion");
});

router.post("/", validate, (req, res) => {
  var suggestionProblems = [],
    unsolvedProblems = [];
  var handle = req.body.handle;
  var url = `https://codeforces.com/api/user.status?handle=${handle}`;
  var userRating,
    verdictMap = new Map(),
    tag1 = "implementation",
    tag2 = "implementation";

  // error callback
  function errorCallback() {
    res.redirect("/suggestion");
  }

  // successfull callback
  function callback() {
    res.render("suggestion", {
      handle: handle,
      suggestionProblems: suggestionProblems,
      unsolvedProblems: unsolvedProblems,
    });
  }
  request(url, { json: true }, (error, response, body) => {
    if (error) console.log(error);
    try {
      if (body.status == "FAILED") {
        errorCallback();
      } else {
        var result = body.result;
        var unsolvedTagMap = new Map();

        for (let obj of result) {
          if (!verdictMap.has(obj.problem.name)) {
            verdictMap.set(obj.problem.name, [obj.verdict, obj]);
          } else {
            if (obj.verdict == "OK") {
              verdictMap.set(obj.problem.name, [obj.verdict, obj]);
            }
          }
        }
        var max = 0;
        for (let [key, value] of verdictMap.entries()) {
          if (value[0] != "OK") {
            var problem =
              "http://codeforces.com/problemset/problem/" +
              String(value[1].contestId) +
              "/" +
              String(value[1].problem.index);
            unsolvedProblems.push([
              problem,
              String(value[1].contestId) + "-" + String(value[1].problem.index),
            ]);
            for (let tag of value[1].problem.tags) {
              if (!unsolvedTagMap.has(tag)) {
                unsolvedTagMap.set(tag, 1);
              } else {
                unsolvedTagMap.set(tag, unsolvedTagMap.get(tag) + 1);
              }
            }
          }
        }
        for (let [key, value] of unsolvedTagMap.entries()) {
          if (value > max) {
            tag2 = tag1;
            tag1 = key;
            max = value;
          }
        }
      }
    } catch (error) {
      console.log("error : ", error);
    }
  });

  request(
    `https://codeforces.com/api/user.info?handles=${handle}`,
    { json: true },
    (error, response, body) => {
      if (error) console.log(error);
      try {
        if (body.status == "FAILED") {
          errorCallback();
        } else {
          var result = body.result;
          userRating = result[0].rating || 800;
        }
      } catch (error) {
        console.log("error : ", error);
      }
    }
  );

  request(
    `https://codeforces.com/api/problemset.problems?tags=${tag1};${tag2}`,
    { json: true },
    (error, response, body) => {
      if (error) console.log(error);
      try {
        if (body.status == "FAILED") {
          errorCallback();
        } else {
          var result = body.result;
          var problems = result.problems;
          for (let obj of problems) {
            if (
              verdictMap.get(obj.name) != "OK" &&
              Number(userRating) <= Number(obj.rating) &&
              Number(obj.rating) <= Number(userRating) + 300
            ) {
              var problem =
                "http://codeforces.com/problemset/problem/" +
                String(obj.contestId) +
                "/" +
                String(obj.index);
              suggestionProblems.push([problem, obj.name]);
            }
            if (suggestionProblems.length == 5) break;
          }
        }
        callback();
      } catch (error) {}
    }
  );
});

module.exports = router;
