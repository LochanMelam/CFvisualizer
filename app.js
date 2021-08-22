// author Lochan Melam
const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection
  .once("open", () => {
    console.log("connected to mongodb......");
  })
  .on("error", (err) => {
    console.log("Error: ", err);
  });
const signupRouter = require("./routes/signup");
const signinRouter = require("./routes/signin");
const signoutRouter = require("./routes/signout");
const authorizeRouter = require("./routes/authorize");
const statsRouter = require("./routes/stats");
const compareRouter = require("./routes/compare");
const suggestionRouter = require("./routes/suggestion");
const forgotPasswordRouter = require("./routes/forgotPassword");
const resetPasswordRouter = require("./routes/resetPassword");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({ secret: "shhhhhh!", saveUninitialized: false, resave: false })
);
app.set("view engine", "pug");
app.set("views", "./views");

app.use("/signup", signupRouter);
app.use("/signin", signinRouter);
app.use("/signout", signoutRouter);
app.use("/authorize", authorizeRouter);
app.use("/stats", statsRouter);
app.use("/compare", compareRouter);
app.use("/suggestion", suggestionRouter);
app.use("/forgotPassword", forgotPasswordRouter);
app.use("/resetPassword", resetPasswordRouter);

app.get("*", (req, res) => {
  req.session.user ? res.redirect("/stats") : res.redirect("/signin");
});
app.listen(process.env.PORT || 3000, () => {
  console.log("server running on port 3000.....");
});
