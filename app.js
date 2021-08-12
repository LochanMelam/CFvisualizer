const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://lochan_admin:cfvisualizer@cluster0.85c9n.mongodb.net/cfDb?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
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

app.get("*", (req, res) => {
  req.session.user ? res.redirect("/stats") : res.redirect("/signin");
});
app.listen(process.env.PORT || 3000, () => {
  console.log("server running on port 3000.....");
});
