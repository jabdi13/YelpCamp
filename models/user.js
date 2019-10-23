var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchemma = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: {type: Boolean, default: false}
});

UserSchemma.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchemma);