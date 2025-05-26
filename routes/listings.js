const express = require('express');
const router = express.Router();
const Listing = require('./models/listing.js');


//testing
router.get('/testing', async (req, res) => {
    let sampleListing = new Listing({
        title: 'Grand Paradise',
        description: 'Sea facing',
        price: 5000,
        location: 'wuhan',
        country: 'China'
    });
    await sampleListing.save();
    console.log('saved in db');
    res.send("Test working well");
});

module.exports = router;