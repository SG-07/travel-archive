const Listing = require('../models/listing');
const ExpressError = require('../utils/expressError.js');

// ✅ Helper: Geocode address using OpenStreetMap (Nominatim)
async function geocodeLocation(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'TravelArchiveApp/1.0'
        }
    });
    const data = await response.json();
    if (data && data[0]) {
        return {
            type: 'Point',
            coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
        };
    }
    return null;
}

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
};

module.exports.renderNewForm = async (req, res) => {
    res.render('listings/new.ejs');
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    console.log("Received ID:", id);

    const listing = await Listing.findById(id).populate({
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('owner');

    if (!listing) {
        console.log("Listing not found!");
        req.flash('error', 'Listing Not Exist!');
        return res.redirect('/listings/allListings');
    }

    console.log("Listing Retrieved:", listing);
    res.render('listings/show.ejs', { listing });
};

module.exports.createListing = async (req, res) => {
    const { location } = req.body.listing;
    console.log('location: '+location);

    //Geocode the location string
    const coordinates = await geocodeLocation(location);
    console.log('coordinates: ' +coordinates);

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing({
        ...req.body.listing,
        owner: req.user._id,
        image: { url, filename },
        coordinates //GeoJSON coordinates saved
    });

    await newListing.save();
    req.flash('success', 'New Listing Created!');
    res.redirect('/listings/allListings');
};

module.exports.renderEditListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        console.log("Listing not found!");
        req.flash('error', 'Listing Not Exist!');
        return res.redirect('/listings/allListings');
    }

    let originalImage = listing.image.url;
    originalImage = originalImage.replace('/upload', '/upload/w_300,h_250,c_fill');

    res.render('listings/edit.ejs', { listing, originalImage });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    if (!req.body.listing) {
        throw new ExpressError(400, 'Send valid data for listing');
    }

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (typeof req.file !== 'undefined') {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        return res.status(404).send("Listing not found");
    }

    console.log(`Listing ${id} deleted`);
    req.flash('success', 'Listing Deleted!');
    res.redirect('/listings/allListings');
};
