var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");
var NodeGeocoder = require('node-geocoder');
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'abdiel8real',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

// Index - Show all campgrounds
router.get("/", async function(req, res) {
    if (req.query.search) {
        try {
            var noMatch;
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            let allCampgrounds = await Campground.find({name: regex});
            if (allCampgrounds < 1){
                noMatch = "No campgrounds match that query, please try again.";
            }
            res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds", noMatch: noMatch});
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("back");
        }
    } else {
        try {
            // Get all Campgrounds from DB
            let allCampgrounds = await Campground.find({});
            res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds", noMatch: noMatch});
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("back");
        }
    }
});

// Create - Add new campground to the database
router.post("/", middleware.isLoggedIn, upload.single('image'), async function(req, res) {
    try {
        let data = await geocoder.geocode(req.body.campground.location);
        if (!data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        req.body.campground.lat = lat;
        req.body.campground.lng = lng;
        let result = await cloudinary.uploader.upload(req.file.path);
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        // add image's public_id to campground object
        req.body.campground.image_id = result.public_id;
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        };
        // Create a new campground and save to DB
        let newlyCreated = await Campground.create(req.body.campground);
        //redirect back to campgrounds page
        res.redirect("/campgrounds/" + newlyCreated.id);
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("back");
    }
});

// New - Create new campground form
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// Show - Show more info about the campground
router.get("/:id", async function(req, res) {
    try {
        // Find campground with the provided ID
        let foundCampground = await Campground.findById(req.params.id).populate("comments").exec();
        // Render show template with that campground
        res.render("campgrounds/show", {campground: foundCampground});
    } catch (e) {
        req.flash("error", "Campground not found");
        res.redirect("back")
    }
});

// Edit Campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, async function (req, res) {
    try {
        let foundCampground = await Campground.findById(req.params.id);
        res.render("campgrounds/edit", {campground: foundCampground});
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("back");
    }
});

// Update Campground route
router.put("/:id", upload.single('image'), middleware.checkCampgroundOwnership, async function (req, res) {
    try {
    const campground = await Campground.findById(req.params.id);
        if (req.file) {
            await cloudinary.v2.uploader.destroy(campground.image_id);
            var result = await cloudinary.v2.uploader.upload(req.file.path);
            campground.image_id = result.public_id;
            campground.image = result.secure_url;
        }
        if (req.body.location !== campground.location)
        {
            var data = await geocoder.geocode(req.body.location);
            campground.lat = data[0].latitude;
            campground.lng = data[0].longitude;
            campground.location = data[0].formattedAddress;
        }
        campground.name = req.body.campground.name;
        campground.description = req.body.campground.description;
        campground.save();
        req.flash("success","Successfully Updated!");
        res.redirect("/campgrounds/" + campground._id);
    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("back")
    }
});

// Destroy Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, async function (req, res) {
    try {
        var campground = await Campground.findById(req.params.id);
        campground.remove();
        await cloudinary.v2.uploader.destroy(campground.image_id);
        for (const comment of campground.comments){
            eval(require("locus"));
            await Comment.findByIdAndRemove(comment);
        }
        req.flash("success", "Campground deleted successfully!");
        res.redirect("/campgrounds");
    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("back");
    }

});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;