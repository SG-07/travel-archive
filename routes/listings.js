const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Listing = require('../models/listing.js');


//testing
// router.get('/testing', async (req, res) => {
//     let sampleListing = new Listing({
//         title: 'Grand Paradise',
//         description: 'Sea facing',
//         price: 5000,
//         location: 'wuhan',
//         country: 'China'
//     });
//     await sampleListing.save();
//     console.log('saved in db');
//     res.send("Test working well");
// });

//Index Route
router.get('/allListings', async (req, res) => {
    allListings = await Listing.find({});
    console.log(allListings);
    res.render('listings/index.ejs', { allListings });
});

//New Route
router.get('/new', async(req, res) => {
    res.render('listings/new.ejs');
});

//Show Route
router.get('/:id', async (req, res) => { // 🔹 Ensure there's NO extra `/listings` prefix
    try {
        let { id } = req.params;
        console.log("Received ID:", id);

        const listing = await Listing.findById(new mongoose.Types.ObjectId(id));

        if (!listing) {
            console.log("Listing not found!");
            return res.status(404).send("Listing not found");
        }

        console.log("Listing Retrieved:", listing);
        res.render('listings/show.ejs', { listing });
    } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).send("Server error");
    }
});

//Create Route
router.post('/', async(req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    console.log(newListing);
    res.redirect('listings/allListings');
});

//Edit Route
router.get('/:id/edit', async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(new mongoose.Types.ObjectId(id));
    res.render('listings/edit.ejs', { listing });
});

//Update Route
router.put('/:id', async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(new mongoose.Types.ObjectId(id), { ...req.body.listing }, { new:true });
    res.redirect(`/listings/${ id }`);
});

//Delete Route
router.delete('/:id', async(req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    console.log(deleteListing);
    res.redirect('allListings');
});


// 🔍 Debugging Logs
router.get('/listings/:id', async (req, res) => {
    console.log(`Requested URL: /listings/${req.params.id}`);

    try {
        let { id } = req.params;
        console.log("Extracted ID:", id);

        // Convert id to ObjectId explicitly
        const listing = await Listing.findById(new mongoose.Types.ObjectId(id));

        if (!listing) {
            console.log("Listing not found!");
            return res.status(404).send("Listing not found");
        }

        console.log("Listing Retrieved:", listing);
        res.render('listings/show.ejs', { listing });
    } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).send("Server error");
    }
});


module.exports = router;




