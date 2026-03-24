const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    empId: { type: String, required: true, unique: true }, // Employee ID (e.g., EMP01)
    name: { type: String, required: true },
    dept: { type: String, required: true }, // IT, HR, etc.
    salary: { type: String, required: true },
    email: String,
    phone: String,
    gender: String,
    role: String,
    username: { type: String }, // Added after registration
    password: { type: String },
    designation: { type: String, required: true }, 
    education: { type: String, required: true },
    profileImage: { type: String, default: "" } // Path for the profile photo
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);