const Listing = require("./models/listing");
const reviewSchema = require('./schemas/reviewSchema');
const ExpressError = require('./utils/expressError.js');
const loginSchema = require('./schemas/loginSchema');
const listingSchema = require('./schemas/listingSchema');
const Review = require("./models/review.js");

//Ensures user is logged in before performing actions
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be logged in first');
        return res.redirect('/login');
    }
    next();
};

//Redirects back to the intended page after login
const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl; //Clears session after redirect
    }
    next();
};

//Ensures only the listing owner can modify a listing
const isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings/allListings');
    }

    if (!req.user || !listing.owner.equals(req.user._id)) {
        req.flash('error', "You don't have permission to modify this listing!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

//Ensures only the listing owner can delete a listing
const isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review) {
        req.flash('error', 'Review not found!');
        return res.redirect('/listings/allListings');
    }

    if (!req.user || !review.author.equals(req.user._id)) {
        req.flash('error', "You don't have permission to modify this review!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

//Validates listing data before saving or updating
const listingValidator = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        return next(new ExpressError(400, errMsg)); 
    }
    next();
};

//Validates login form data
const loginValidator = (req, res, next) => {
    let { error } = loginSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        return next(new ExpressError(400, errMsg));
    }
    next();
};

//Validates review data before storing
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        return next(new ExpressError(400, errMsg));
    }
    next();
};

module.exports = { isLoggedIn, saveRedirectUrl, isOwner, listingValidator, loginValidator, validateReview, isReviewAuthor };
