const express = require('express');
const router = express.Router({ mergeParams: true });
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/expressError.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');  


//Post route
router.post('/', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
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
}));

//Delete Route
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});  //to delete from listingSchema review array
    await Review.findByIdAndDelete(reviewId); //to delete from Review Schema 

    res.redirect(`/listings/${id}`);

}));


module.exports = router;