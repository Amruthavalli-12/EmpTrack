const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
    empId: { type: String, required: true },
    name: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, default: "Pending" },
    appliedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leave', LeaveSchema);