const express = require("express");
const { render } = require("pug");
const request = require("request");
const router = express.Router();

var languageList = [],
  LanguageList = [],
  languageCount = [],
  LanguageCount = [],
  verdictList = [],
  VerdictList = [],
  verdictCount = [],
  VerdictCount = [],
  tagList = [],
  TagList = [],
  tagCount = [],
  TagCount = [],
  indexList = [],
  IndexList = [],
  indexCount = [],
  IndexCount = [],
  difficultyList = [],
  DifficultyList = [],
  difficultyCount = [],
  DifficultyCount = [];
var problemsTried = 0,
  ProblemsTried = 0,
  contestsAttempted = 0,
  ContestsAttempted = 0,
  problemsSolved = 0,
  ProblemsSolved = 0,
  averageAttempts = 0,
  AverageAttempts = 0,
  maxAttempts = 0,
  MaxAttempts = 0,
  solvedInAttempt = 0,
  SolvedInAttempt = 0,
  currentRating = 0,
  CurrentRating = 0,
  maxRating = 0,
  MaxRating = 0,
  minRating = 0,
  MinRating = 0,
  maxUp = 0,
  MaxUp = 0,
  maxDown = 0,
  MaxDown = 0,
  bestRank = 0,
  BestRank = 0,
  worstRank = 0,
  WorstRank = 0;

function flushData() {
  (languageList = []),
    (LanguageList = []),
    (languageCount = []),
    (LanguageCount = []),
    (verdictList = []),
    (VerdictList = []),
    (verdictCount = []),
    (VerdictCount = []),
    (tagList = []),
    (TagList = []),
    (tagCount = []),
    (TagCount = []),
    (indexList = []),
    (IndexList = []),
    (indexCount = []),
    (IndexCount = []),
    (difficultyList = []),
    (DifficultyList = []),
    (difficultyCount = []),
    (DifficultyCount = []);
  (problemsTried = 0),
    (ProblemsTried = 0),
    (contestsAttempted = 0),
    (ContestsAttempted = 0),
    (problemsSolved = 0),
    (ProblemsSolved = 0),
    (averageAttempts = 0),
    (AverageAttempts = 0),
    (maxAttempts = 0),
    (MaxAttempts = 0),
    (solvedInAttempt = 0),
    (SolvedInAttempt = 0),
    (currentRating = 0),
    (CurrentRating = 0),
    (maxRating = 0),
    (MaxRating = 0),
    (minRating = 0),
    (MinRating = 0),
    (maxUp = 0),
    (MaxUp = 0),
    (maxDown = 0),
    (MaxDown = 0),
    (bestRank = 0),
    (BestRank = 0),
    (worstRank = 0),
    (WorstRank = 0);
}
// function which requests data from codeforces api
function getData(url) {
  return new Promise(function (resolve, reject) {
    request(url, { jason: true }, (error, response, body) => {
      if (error) reject(error);
      try {
        body = JSON.parse(body);
        if (body.status === "FAILED") {
          reject(body);
        } else {
          resolve(body.result);
        }
      } catch (err) {
        reject(err);
      }
    });
  });
}

// validate function
function validate(req, res, next) {
  if (!req.session.user) {
    console.log("not validated");
    res.redirect("/signin");
    return;
  }
  next();
}

router.get("/", validate, (req, res) => {
  res.render("compare");
});

router.post("/", validate, (req, res) => {
  var handle = req.body.handle1;
  var Handle = req.body.handle2;
  var url1 = `https://codeforces.com/api/user.status?handle=${handle}`;
  var url2 = `https://codeforces.com/api/user.rating?handle=${handle}`;
  var url3 = `https://codeforces.com/api/user.status?handle=${Handle}`;
  var url4 = `https://codeforces.com/api/user.rating?handle=${Handle}`;
  var compare = {};
  flushData();
  getData(url1)
    //chart data for languages and problems solved in each language
    .then((result) => {
      var languageMap = new Map();
      for (let pl of result) {
        if (!languageMap.has(pl.programmingLanguage))
          languageMap.set(pl.programmingLanguage, 1);
        else
          languageMap.set(
            pl.programmingLanguage,
            languageMap.get(pl.programmingLanguage) + 1
          );
      }
      for (let [key, value] of languageMap.entries()) {
        languageList.push(key);
        languageCount.push(value);
      }
      return result;
    })
    // chart data for verdicts
    .then((result) => {
      var verdictMap = new Map();
      for (let v of result) {
        if (!verdictMap.has(v.verdict)) verdictMap.set(v.verdict, 1);
        else verdictMap.set(v.verdict, verdictMap.get(v.verdict) + 1);
      }
      for (let [key, value] of verdictMap.entries()) {
        verdictList.push(key);
        verdictCount.push(value);
      }
      return result;
    })
    // chart data for tags
    .then((result) => {
      var tagMap = new Map();
      for (let obj of result) {
        for (let tag of obj.problem.tags) {
          if (!tagMap.has(tag)) tagMap.set(tag, 1);
          else tagMap.set(tag, tagMap.get(tag) + 1);
        }
      }
      for (let [key, value] of tagMap.entries()) {
        tagList.push(key);
        tagCount.push(value);
      }
      return result;
    }) // bar graph data for index of the problem
    .then((result) => {
      var indexMap = new Map();
      var uniqueMap = new Map();
      indexMap.set("A", 0);
      indexMap.set("B", 0);
      indexMap.set("C", 0);
      indexMap.set("D", 0);
      indexMap.set("E", 0);
      indexMap.set("F", 0);
      indexMap.set("G", 0);
      indexMap.set("H", 0);
      indexMap.set("I", 0);
      for (let v of result) {
        if (v.verdict == "OK" && !uniqueMap.has(v.problem.name)) {
          uniqueMap.set(v.problem.name, 1);
          if (!indexMap.has(v.problem.index[0]))
            indexMap.set(v.problem.index[0], 1);
          else
            indexMap.set(
              v.problem.index[0],
              indexMap.get(v.problem.index[0]) + 1
            );
        }
      }
      for (let [key, value] of indexMap.entries()) {
        indexList.push(key);
        indexCount.push(value);
      }
      return result;
    })
    // bar graph data for difficulty of the problem
    .then((result) => {
      var difficultyMap = new Map();
      var uniqueMap = new Map();
      for (let v of result) {
        if (
          v.verdict == "OK" &&
          v.problem.rating != undefined &&
          !uniqueMap.has(v.problem.name)
        ) {
          uniqueMap.set(v.problem.name, 1);
          if (!difficultyMap.has(v.problem.rating))
            difficultyMap.set(v.problem.rating, 1);
          else
            difficultyMap.set(
              v.problem.rating,
              difficultyMap.get(v.problem.rating) + 1
            );
        }
      }
      for (let i = 800; i <= 4000; i++) {
        if (difficultyMap.has(i)) {
          difficultyList.push(i);
          difficultyCount.push(difficultyMap.get(i));
        }
      }

      return result;
    })
    // table data
    .then((result) => {
      var statsMap = new Map();
      for (let obj of result) {
        if (statsMap.has(obj.problem.name)) {
          if (statsMap.get(obj.problem.name) == "OK") {
            continue;
          } else if (obj.verdict == "OK") {
            statsMap.set(obj.problem.name, "OK");
            problemsSolved += 1;
          }
        } else {
          statsMap.set(obj.problem.name, obj.verdict);
          if (obj.verdict == "OK") {
            problemsSolved += 1;
          }
          problemsTried += 1;
        }
      }
      averageAttempts = (result.length / problemsSolved).toPrecision(3);
      return getData(url2);
    })
    .then((result) => {
      contestsAttempted = result.length;
      currentRating = result[contestsAttempted - 1].newRating;
      for (let i = 0; i < result.length; i++) {
        compare[result[i].contestId] = [1, result[i]];
        if (!i) {
          maxRating = result[i].newRating;
          minRating = result[i].newRating;
          bestRank = result[i].rank;
          worstRank = result[i].rank;
          maxUp = result[i].newRating;
        } else {
          maxRating = Math.max(
            result[i].oldRating,
            result[i].newRating,
            maxRating
          );
          minRating = Math.min(
            result[i].oldRating,
            result[i].newRating,
            minRating
          );
          maxUp = Math.max(maxUp, result[i].newRating - result[i].oldRating);
          maxDown = Math.min(
            maxDown,
            result[i].newRating - result[i].oldRating
          );
          bestRank = Math.min(result[i].rank, bestRank);
          worstRank = Math.max(result[i].rank, worstRank);
        }
      }
      maxDown = Math.abs(maxDown);
      console.log("user1");
      return getData(url3);
    })
    // generates handl2 data
    //chart data for languages and problems solved in each language
    .then((result) => {
      var languageMap = new Map();
      for (let pl of result) {
        if (!languageMap.has(pl.programmingLanguage))
          languageMap.set(pl.programmingLanguage, 1);
        else
          languageMap.set(
            pl.programmingLanguage,
            languageMap.get(pl.programmingLanguage) + 1
          );
      }
      for (let [key, value] of languageMap.entries()) {
        LanguageList.push(key);
        LanguageCount.push(value);
      }
      return result;
    })
    // chart data for verdicts
    .then((result) => {
      var verdictMap = new Map();
      for (let v of result) {
        if (!verdictMap.has(v.verdict)) verdictMap.set(v.verdict, 1);
        else verdictMap.set(v.verdict, verdictMap.get(v.verdict) + 1);
      }
      for (let [key, value] of verdictMap.entries()) {
        VerdictList.push(key);
        VerdictCount.push(value);
      }
      return result;
    })
    // chart data for tags
    .then((result) => {
      var tagMap = new Map();
      for (let obj of result) {
        for (let tag of obj.problem.tags) {
          if (!tagMap.has(tag)) tagMap.set(tag, 1);
          else tagMap.set(tag, tagMap.get(tag) + 1);
        }
      }
      for (let [key, value] of tagMap.entries()) {
        TagList.push(key);
        TagCount.push(value);
      }
      return result;
    }) // bar graph data for index of the problem
    .then((result) => {
      var indexMap = new Map();
      var uniqueMap = new Map();
      indexMap.set("A", 0);
      indexMap.set("B", 0);
      indexMap.set("C", 0);
      indexMap.set("D", 0);
      indexMap.set("E", 0);
      indexMap.set("F", 0);
      indexMap.set("G", 0);
      indexMap.set("H", 0);
      indexMap.set("I", 0);
      for (let v of result) {
        if (v.verdict == "OK" && !uniqueMap.has(v.problem.name)) {
          uniqueMap.set(v.problem.name, 1);
          if (!indexMap.has(v.problem.index[0]))
            indexMap.set(v.problem.index[0], 1);
          else
            indexMap.set(
              v.problem.index[0],
              indexMap.get(v.problem.index[0]) + 1
            );
        }
      }
      for (let [key, value] of indexMap.entries()) {
        IndexList.push(key);
        IndexCount.push(value);
      }
      return result;
    })
    // bar graph data for difficulty of the problem
    .then((result) => {
      var difficultyMap = new Map();
      var uniqueMap = new Map();
      for (let v of result) {
        if (
          v.verdict == "OK" &&
          v.problem.rating != undefined &&
          !uniqueMap.has(v.problem.name)
        ) {
          uniqueMap.set(v.problem.name, 1);
          if (!difficultyMap.has(v.problem.rating))
            difficultyMap.set(v.problem.rating, 1);
          else
            difficultyMap.set(
              v.problem.rating,
              difficultyMap.get(v.problem.rating) + 1
            );
        }
      }
      for (let i = 800; i <= 4000; i++) {
        if (difficultyMap.has(i)) {
          DifficultyList.push(i);
          DifficultyCount.push(difficultyMap.get(i));
        }
      }

      return result;
    })
    // table data
    .then((result) => {
      var statsMap = new Map();
      for (let obj of result) {
        if (statsMap.has(obj.problem.name)) {
          if (statsMap.get(obj.problem.name) == "OK") {
            continue;
          } else if (obj.verdict == "OK") {
            statsMap.set(obj.problem.name, "OK");
            ProblemsSolved += 1;
          }
        } else {
          statsMap.set(obj.problem.name, obj.verdict);
          if (obj.verdict == "OK") {
            ProblemsSolved += 1;
          }
          ProblemsTried += 1;
        }
      }
      AverageAttempts = (result.length / ProblemsSolved).toPrecision(3);
      return getData(url4);
    })
    .then((result) => {
      ContestsAttempted = result.length;
      CurrentRating = result[ContestsAttempted - 1].newRating;
      for (let i = 0; i < result.length; i++) {
        if (compare[result[i].contestId]) {
          compare[result[i].contestId].push(result[i]);
        }
        if (!i) {
          MaxRating = result[i].newRating;
          MinRating = result[i].newRating;
          BestRank = result[i].rank;
          WorstRank = result[i].rank;
          MaxUp = result[i].newRating;
        } else {
          MaxRating = Math.max(
            result[i].oldRating,
            result[i].newRating,
            MaxRating
          );
          MinRating = Math.min(
            result[i].oldRating,
            result[i].newRating,
            MinRating
          );
          MaxUp = Math.max(MaxUp, result[i].newRating - result[i].oldRating);
          MaxDown = Math.min(
            MaxDown,
            result[i].newRating - result[i].oldRating
          );
          BestRank = Math.min(result[i].rank, BestRank);
          WorstRank = Math.max(result[i].rank, WorstRank);
        }
      }
      MaxDown = Math.abs(MaxDown);
      console.log("user2");
      res.render("compare", {
        compare: compare,
        handle: handle,
        Handle: Handle,
        languageList: languageList,
        languageCount: languageCount,
        verdictList: verdictList,
        verdictCount: verdictCount,
        tagList: tagList,
        tagCount: tagCount,
        indexList: indexList,
        indexCount: indexCount,
        difficultyList: difficultyList,
        difficultyCount: difficultyCount,
        problemsTried: problemsTried,
        problemsSolved: problemsSolved,
        contestsAttempted: contestsAttempted,
        currentRating: currentRating,
        maxRating: maxRating,
        minRating: minRating,
        maxUp: maxUp,
        maxDown: maxDown,
        bestRank: bestRank,
        worstRank: worstRank,
        averageAttempts: averageAttempts,
        LanguageList: LanguageList,
        LanguageCount: LanguageCount,
        VerdictList: VerdictList,
        VerdictCount: VerdictCount,
        TagList: TagList,
        TagCount: TagCount,
        IndexList: IndexList,
        IndexCount: IndexCount,
        DifficultyList: DifficultyList,
        DifficultyCount: DifficultyCount,
        ProblemsTried: ProblemsTried,
        ProblemsSolved: ProblemsSolved,
        ContestsAttempted: ContestsAttempted,
        CurrentRating: CurrentRating,
        MaxRating: MaxRating,
        MinRating: MinRating,
        MaxUp: MaxUp,
        MaxDown: MaxDown,
        BestRank: BestRank,
        WorstRank: WorstRank,
        AverageAttempts: AverageAttempts,
      });
    })
    .catch((error) => {
      console.log("logging error", error);
      res.send(error);
    });
});

module.exports = router;
