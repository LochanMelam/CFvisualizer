const express = require("express");
const { render } = require("pug");
const request = require("request");
const router = express.Router();

// validate function(the post route will only be accessable only if the user is logged in)
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
  //below variables hold the data based on cf User name
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
  var compare = {};
  var handle = req.body.handle1; // handle of user 1
  var Handle = req.body.handle2; // handle of user 2
  // url's that will fetch the required data from Codeforces Api
  var url1 = `https://codeforces.com/api/user.status?handle=${handle}`; // url to get the data(problems attempted including contests) of handle 1
  var url2 = `https://codeforces.com/api/user.rating?handle=${handle}`; // url to get the data(only contests) of handle 1
  var url3 = `https://codeforces.com/api/user.status?handle=${Handle}`; // url to get the data(problems attempted including contests) of handle 2
  var url4 = `https://codeforces.com/api/user.rating?handle=${Handle}`; // url to get the data(only contests) of handle 2

  //error callback => will take care if there is any error while getting data from cf api
  function errorCallback(line) {
    res.redirect("/compare");
    console.log(line);
  }
  // successfull callback => if all the cf api calls are successfull then they will be passed to the render page
  function callback() {
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
  }
  // four functions(function1,2,3,4) => each function will fetch data based on the url. example * function1 => url 1 , function2 => url 2 likewise
  // As node js is asynchronous and cf api takes 2-4 sec latency to fetch data each function call is called at the end of the execution of its previous function
  // function2 call will be inside function1 block => function3 call will be inside function2 block => function4 call will be inside function3 block

  // executes url 1
  function function1() {
    request(url2, { json: true }, (error, response, body) => {
      console.log("url 1");
      if (error) console.log(error);
      try {
        if (body.status == "FAILED") {
          // errorCallback("line 85");
        } else {
          var result = body.result;
          if (result.length != 0) {
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
                maxUp = Math.max(
                  maxUp,
                  result[i].newRating - result[i].oldRating
                );
                maxDown = Math.min(
                  maxDown,
                  result[i].newRating - result[i].oldRating
                );
                bestRank = Math.min(result[i].rank, bestRank);
                worstRank = Math.max(result[i].rank, worstRank);
              }
            }
            maxDown = Math.abs(maxDown);
          }
        }
        function2(); // function call to fetch data(url2) from cf api
      } catch (error) {
        console.log("error : ", error);
        errorCallback("line 177");
      }
    });
  }

  // executes url 2
  function function2() {
    request(url4, { json: true }, (error, response, body) => {
      console.log("url2");
      if (error) console.log(error);
      try {
        if (body.status == "FAILED") {
          // errorCallback("line 85");
        } else {
          var result = body.result;
          if (result.length != 0) {
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
                MaxUp = Math.max(
                  MaxUp,
                  result[i].newRating - result[i].oldRating
                );
                MaxDown = Math.min(
                  MaxDown,
                  result[i].newRating - result[i].oldRating
                );
                BestRank = Math.min(result[i].rank, BestRank);
                WorstRank = Math.max(result[i].rank, WorstRank);
              }
            }
            MaxDown = Math.abs(maxDown);
          }
        }
        function3(); // function call to fetch data(url3) from cf api
      } catch (error) {
        console.log("error : ", error);
        errorCallback("line 225");
      }
    });
  }

  // executes url 3
  function function3() {
    request(url1, { json: true }, (error, response, body) => {
      console.log("url3");
      if (error) console.log(error);
      try {
        if (body.status == "FAILED") {
          // errorCallback("line 234");
        } else {
          var result = body.result;
          //chart data for languages and problems solved in each language
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
          // chart data for verdicts
          var verdictMap = new Map();
          for (let v of result) {
            if (!verdictMap.has(v.verdict)) verdictMap.set(v.verdict, 1);
            else verdictMap.set(v.verdict, verdictMap.get(v.verdict) + 1);
          }
          for (let [key, value] of verdictMap.entries()) {
            verdictList.push(key);
            verdictCount.push(value);
          }
          // chart data for tags
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
          // bar graph data for index of the problem
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
          // bar graph data for difficulty of the problem
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
          for (let i = 800; i <= 4000; i += 100) {
            if (difficultyMap.has(i)) {
              difficultyList.push(i);
              difficultyCount.push(difficultyMap.get(i));
            }
          }
          // table data
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
        }
        function4(); // function call to fetch data(url4) from cf api
      } catch (error) {
        errorCallback("line 353");
      }
    });
  }

  // executes url 4
  function function4(params) {
    request(url3, { json: true }, (error, response, body) => {
      console.log("url4");
      if (error) console.log(error);
      try {
        if (body.status == "FAILED") {
          // errorCallback("line 360");
        } else {
          var result = body.result;
          //chart data for languages and problems solved in each language
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
          // chart data for verdicts
          var verdictMap = new Map();
          for (let v of result) {
            if (!verdictMap.has(v.verdict)) verdictMap.set(v.verdict, 1);
            else verdictMap.set(v.verdict, verdictMap.get(v.verdict) + 1);
          }
          for (let [key, value] of verdictMap.entries()) {
            VerdictList.push(key);
            VerdictCount.push(value);
          }
          // chart data for tags
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
          // bar graph data for index of the problem
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
          // bar graph data for difficulty of the problem
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
          for (let i = 800; i <= 4000; i += 100) {
            if (difficultyMap.has(i)) {
              DifficultyList.push(i);
              DifficultyCount.push(difficultyMap.get(i));
            }
          }

          // table data
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
        }
        callback();
      } catch (error) {
        errorCallback("line 476");
      }
    });
  }
  function1(); // function call to fetch data(url1) from cf api
});

module.exports = router;
