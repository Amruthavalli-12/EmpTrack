const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// API to Add or Update Employee (Synchronized with saveEmployee() logic)
router.post('/save', async (req, res) => {
    const { id, name, dept, salary } = req.body;

    try {
        // Check if the employee already exists in MongoDB
        let emp = await Employee.findOne({ id });

        if (emp) {
            // Update the existing employee record
            emp.name = name;
            emp.dept = dept;
            emp.salary = salary;
            await emp.save();
            return res.json({ message: "Employee Updated Successfully ✅" });
        } else {
            // Create and save a new employee record
            const newEmp = new Employee({ id, name, dept, salary });
            await newEmp.save();
            return res.json({ message: "Employee Added Successfully ✅" });
        }
    } catch (err) {
        // Handle potential server or database errors
        res.status(500).json({ error: err.message });
    }
});

// API to Delete an Employee record
router.delete('/delete/:id', async (req, res) => {
    try {
        // Find by custom ID and remove from the collection
        await Employee.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Employee Deleted Successfully 🗑️" });
    } catch (err) {
        // Handle potential server or database errors
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;