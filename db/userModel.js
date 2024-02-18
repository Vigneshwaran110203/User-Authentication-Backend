const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please Provide an Email"],
        unique: [true, "Email Exist"],
    },
    password: {
        type: String,
        required: [true, "Please Provide a password"],
        unique: false,
    },
})


// Create a user table or collection if there is no table with that name already.

module.exports = mongoose.model.Users || mongoose.model("User", UserSchema)