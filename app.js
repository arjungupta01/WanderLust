if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//router
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const users = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.ATLASDB_URL;
main()
  .then((res) => {
    console.log("connectde to db");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const port = 3000;

// app.get("/", (req, res) => res.send("Hello Airbnb"));

//connect-mongo
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("session store error");
});

//implementing session/cookies
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  //   cookie:
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

//using session/cookies/flash
app.use(session(sessionOptions));
app.use(flash());

//implementing passport(always after sessions)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//implementing flash local
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// //demo user for authentication
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "stud@gmail.com",
//     username: "detla-stud",
//   });
//   //storing fakeuser using register method
//   let registeredUser = await User.register(fakeUser, "hello");
//   res.send(registeredUser);
// });

//routes
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", users);

//standard response in case if any user send request to some different route
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

//handling error
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
