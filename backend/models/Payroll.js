const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
    empId: String,
    name: String,
    month: String,        
    baseSalary: Number,
    netSalary: Number,
    deduction: Number,
    absent: Number,
    status: { type: String, default: 'PAID' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payroll', PayrollSchema);