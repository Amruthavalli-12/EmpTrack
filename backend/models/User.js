const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    empId: { type: String, required: true, unique: true }, 
    // Removed 'unique' from username and kept it as a simple String
    // Username validity will be checked in the controller during registration
    username: { type: String, default: "" }, 
    password: { type: String, default: "" },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    name: String,
    dept: String,
    salary: String,
    gender: { 
        type: String, 
        default: "Male", // Providing a default value so it's not empty
        enum: ["Male", "Female", "Other"] // Restricts input to these three values
    },
    profilePic: { type: String, default: "" },
    // These fields are required for the User schema in models/User.js
    designation: { type: String },
    education: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);