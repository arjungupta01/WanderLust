const Review = require("../models/review.js");

//create review route
module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created!!");

  // res.send("new review saved");
  res.redirect(`/listings/${listing._id}`);
};

//delete review route
module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;

  //deleting the review form the listing array
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  await Review.findById(reviewId);
  req.flash("success", "Review Deleted!!");

  res.redirect(`/listings/${id}`);
};
