var express = require("express");
var router  = express.Router({mergeParams: true});
var Comment = require("../models/comment");
var Campground = require("../models/campground");
var middleware = require("../middleware/index");

// Comments new
router.get("/new", middleware.isLoggedIn, async function(req, res) {
    try {
        const campground = await Campground.findById(req.params.id);
        res.render("comments/new", {campground: campground});
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("back");
    }
});


// Comments create
router.post("/", middleware.isLoggedIn, async function(req, res) {
    try {
        // lookup the campground using ID
        const campground = await Campground.findById(req.params.id);

        // create a new comment
        const comment = await Comment.create(req.body.comment);

        // add username and id to comment
        comment.author.id = req.user._id;
        comment.author.username = req.user.username;

        // save comment
        comment.save();

        // reference comment to campground
        campground.comments.push(comment);
        campground.save();

        // redirect campground show page
        req.flash("success", "Successfully added comment");
        res.redirect("/campgrounds/" + campground._id);
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("back");
    }
});

// Edit Comments Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err || !foundCampground){
            req.flash("error", "No campground found");
            res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});

// Update Comments Route
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// Destroy Comments Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    //Find by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;