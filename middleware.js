const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.user); this helps in checking if user is logged in or not
  if (!req.isAuthenticated()) {
    //saving info(redirect url)
    req.session.redirectUrl = req.originalUrl;

    req.flash("error", "you must be logged in!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl; //svaing url in locals
  }
  next();
};


//middleware for authorization for listings
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "you are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

//middleware for authorization for review
module.exports.isAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "you are not the author of this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
//schema validation into middleware
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body); //checking all fields condition are passed
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//REVIEW schema validation into middleware
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body); //checking all fields condition are passed
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
