const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isOwner, listingValidator } = require('../middleware'); 
const listingController = require('../controllers/listing.js');


//Index Route - Fetch all listings
router.get('/allListings', wrapAsync(listingController.index));

//New Route - Render form to create a new listing
router.get('/new', isLoggedIn, wrapAsync(listingController.renderNewForm));


//Create Route - Save a new listing to the database
router.post('/', isLoggedIn, listingValidator, wrapAsync(listingController.createListing));

//Edit Route - Render edit form for a listing
router.get('/:id/edit', isLoggedIn, wrapAsync(listingController.renderEditListing));

router.route('/:id',)
    .get(wrapAsync(listingController.showListing))     //Show Route - Fetch a single listing by ID
    .put(listingValidator, isOwner, wrapAsync(listingController.updateListing))    //Update Route - Update a listing in the database
    .delete( isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));    //Delete Route - Remove a listing from the database

module.exports = router;