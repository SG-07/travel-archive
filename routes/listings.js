const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/expressError.js');
const { isLoggedIn, isOwner, listingValidator } = require('../middleware');  


//Index Route - Fetch all listings
router.get('/allListings', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
}));

//New Route - Render form to create a new listing
router.get('/new', isLoggedIn, wrapAsync(async (req, res) => {
    res.render('listings/new.ejs');
}));

//Show Route - Fetch a single listing by ID
router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    console.log("Received ID:", id);

    const listing = await Listing.findById(id).populate({path: 'reviews', populate: {path : 'author',}, } ).populate('owner'); 

    if (!listing) {
        console.log("Listing not found!");
        req.flash('error', 'Listing Not Exist!');
        return res.redirect('/listings/allListings');
    }

    console.log("Listing Retrieved:", listing);
    res.render('listings/show.ejs', { listing });
}));

//Create Route - Save a new listing to the database
router.post('/', isLoggedIn, listingValidator, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', 'New Listing Created!');
    console.log(newListing);
    res.redirect('/listings/allListings'); 
}));

//Edit Route - Render edit form for a listing
router.get('/:id/edit', isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        console.log("Listing not found!");
        req.flash('error', 'Listing Not Exist!');
        return res.redirect('/listings/allListings');
    }
    
    res.render('listings/edit.ejs', { listing });
}));

//Update Route - Update a listing in the database
router.put('/:id', listingValidator, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!req.body.listing) {
        throw new ExpressError(400, 'Send valid data for listing');
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
}));


//Delete Route - Remove a listing from the database
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    
    if (!deletedListing) {
        return res.status(404).send("Listing not found");
    }

    console.log(`Listing ${id} deleted`);
    req.flash('success', 'Listing Deleted!');
    res.redirect('/listings/allListings'); 
}));

module.exports = router;
