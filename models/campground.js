var mongoose = require("mongoose");

// Schema
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    image_id: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: {type: Date, default: Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Campground", campgroundSchema);