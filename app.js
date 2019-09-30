var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    seedDB      = require("./seeds");
    
mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });

app.use('/js', express.static(__dirname + '/node_modules/jquery/dist/js')); // redirect jquery JS
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
seedDB();


app.get("/", function(req, res){
    res.render("landing");
});

// Index - Show all campgrounds
app.get("/campgrounds", function(req, res){
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
app.post("/campgrounds", function(req, res){
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
app.get("/campgrounds/new", function(req, res) {
    res.render("campgrounds/new");
});

// Show - Show more info about the capground
app.get("/campgrounds/:id", function(req, res) {
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

// ===========> Comments Route <============
app.get("/campgrounds/:id/comments/new", function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err)
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

app.post("/campgrounds/:id/comments", function(req, res) {
    // lookup the campground using ID
    Campground.findById(req.params.id, function(err, campground) {
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // create a new comment
            Comment.create(req.body.comment, function(err, comment) {
                if(err){
                    console.log(err);
                } else {
                    // reference comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    // redirect campground show page
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp Server is listening...");
});