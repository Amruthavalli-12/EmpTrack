const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    dept: { 
        type: String, 
        required: true,
        enum: ['AIML', 'DS', 'CS', 'IT', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'PHARMA', 'GENERAL']
    },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    task: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('TimeTable', timetableSchema);