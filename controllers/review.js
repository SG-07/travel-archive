const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const ExpressError = require('../utils/expressError.js');

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    console.log("Listing Reviews:", listing.reviews);

    res.redirect(`/listings/${listing._id}`);
}

module.exports.editReview = async (req, res) => {
    let { id, reviewId } = req.params;

    const listing = await Listing.findById(id);
    let review = await Review.findById(reviewId);

    if(!review) {
        req.flash('error', 'Some error occured. Contact support if happens again');
        return res.redirect(`/listings/${listing._id}`);
    }

    res.render('reviews/edit.ejs', { listing, review });

}

module.exports.updateReview = async (req, res) => {
    let { id, reviewId } = req.params;
    let listing = await Listing.findById(id);
    let review = await Review.findById(reviewId);

    if(!review) {
        req.flash('error', 'Failed to update comment. Contact Support!');
        return res.redirect(`/listings/${listing._id}`);
    }

    await Review.findByIdAndUpdate(reviewId,  { ...req.body.review }, { new: true });

    req.flash('success', 'Review Updated!');
    res.redirect(`/listings/${id}`);

}

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});  //to delete from listingSchema review array
    await Review.findByIdAndDelete(reviewId); //to delete from Review Schema 

    res.redirect(`/listings/${id}`);

}