var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchemma = new mongoose.Schema({
    username: String,
    password: String
});

UserSchemma.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchemma);