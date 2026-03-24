const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    empId: { type: String, required: true },
    month: { type: String, required: true },
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 }
}, { timestamps: true
});

module.exports = mongoose.model('Attendance', AttendanceSchema);