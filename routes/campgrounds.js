var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");

// Index - Show all campgrounds
router.get("/", function(req, res){
    // Get all Campgrounds from DB
    Campground.find({}, function(err, allCampgrounds) {
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

// Create - Add new campground to the database
router.post("/", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image, description: desc};
    // Create new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
        if(err){
            console.log(err);
        } else {
            // Redirect to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

// New - Create new campground form
router.get("/new", function(req, res) {
    res.render("campgrounds/new");
});

// Show - Show more info about the campground
router.get("/:id", function(req, res) {
    // Find campground with the provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            // Render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

module.exports = router;