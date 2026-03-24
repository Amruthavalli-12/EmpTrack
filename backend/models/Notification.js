const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    dept: { type: String, default: "All" },
    message: { type: String, required: true },
    priority: { type: String, default: "low" },
    // Changed the type from String to Date
    date: { type: Date, default: Date.now }
}); // Timestamps would also provide the 'createdAt' field if enabled

module.exports = mongoose.model('Notification', NotificationSchema);