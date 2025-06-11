const Listing = require('../models/listing');
const ExpressError = require('../utils/expressError.js');

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
};

module.exports.renderNewForm = async (req, res) => {
    res.render('listings/new.ejs');
}

module.exports.showListing = async (req, res) => {
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
}

module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', 'New Listing Created!');
    console.log(newListing);
    res.redirect('/listings/allListings'); 
}

module.exports.renderEditListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        console.log("Listing not found!");
        req.flash('error', 'Listing Not Exist!');
        return res.redirect('/listings/allListings');
    }
    
    res.render('listings/edit.ejs', { listing });
}

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    if (!req.body.listing) {
        throw new ExpressError(400, 'Send valid data for listing');
    }

    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
    
}

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    
    if (!deletedListing) {
        return res.status(404).send("Listing not found");
    }

    console.log(`Listing ${id} deleted`);
    req.flash('success', 'Listing Deleted!');
    res.redirect('/listings/allListings'); 
}