const User = require("../models/user.js");

//signup Form
module.exports.signupForm = (req, res) => {
  res.render("users/signup.ejs");
};

//sigup route
module.exports.signUp = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registerUser = await User.register(newUser, password);
    //   console.log(registerUser);
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

//Login Form
module.exports.loginForm = (req, res) => {
  res.render("users/login.ejs");
};

//login route
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to Wanderlust");
  //checking is loggedin trigering or not
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

//logout route
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully");
    res.redirect("/listings");
  });
};
