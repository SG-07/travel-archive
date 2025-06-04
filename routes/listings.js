const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/expressError.js');
const listingSchema = require('../schemas/listingSchema');

//ListingValidator function
const listingValidator = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};    


// ✅ Index Route - Fetch all listings
router.get('/allListings', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    console.log(allListings);
    res.render('listings/index.ejs', { allListings });
}));

// ✅ New Route - Render form to create a new listing
router.get('/new', wrapAsync(async (req, res) => {
    res.render('listings/new.ejs');
}));

// ✅ Show Route - Fetch a single listing by ID
router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    console.log("Received ID:", id);

    const listing = await Listing.findById(id); // 🔹 Removed unnecessary ObjectId conversion

    if (!listing) {
        console.log("Listing not found!");
        return res.status(404).send("Listing not found");
    }

    console.log("Listing Retrieved:", listing);
    res.render('listings/show.ejs', { listing });
}));

// ✅ Create Route - Save a new listing to the database
router.post('/', listingValidator, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    console.log(newListing);
    res.redirect('/listings/allListings'); // 🔹 Fixed redirect path
}));

// ✅ Edit Route - Render edit form for a listing
router.get('/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render('listings/edit.ejs', { listing });
}));

// ✅ Update Route - Update a listing in the database
router.put('/:id', listingValidator, wrapAsync(async (req, res) => {
    const { id } = req.params;
    if(!req.body.listing) {
        throw new ExpressError(400, 'Send valid data for listing');
    }
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (!listing) {
        return res.status(404).send("Listing not found");
    }

    res.redirect(`/listings/${id}`);
}));

// ✅ Delete Route - Remove a listing from the database
router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    
    if (!deletedListing) {
        return res.status(404).send("Listing not found");
    }

    console.log(`Listing ${id} deleted`);
    res.redirect('/listings/allListings'); // 🔹 Fixed redirect path
}));

module.exports = router;
