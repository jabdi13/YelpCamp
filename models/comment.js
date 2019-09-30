var mongoose = require("mongoose");

var commentSchemma = mongoose.Schema({
    text: String,
    author: String
});

module.exports = mongoose.model("Comment", commentSchemma);