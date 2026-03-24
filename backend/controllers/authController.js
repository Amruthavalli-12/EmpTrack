const User = require('../models/User'); // User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. ADMIN LOGIN
exports.adminLogin = async (req, res) => {
    const { user, pass } = req.body;
    // Hardcoded as per your frontend logic
    if (user === "admin" && pass === "admin123") {
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ message: "Admin Login Successful! ✅", token });
    }
    res.status(401).json({ message: "Invalid Admin Credentials! ❌" });
};

// 2. EMPLOYEE REGISTRATION
exports.registerEmployee = async (req, res) => {
    const { id, user, pass } = req.body;
    try {
        // Find employee by the ID created by the admin
        const emp = await User.findOne({ empId: id });
        
        if (!emp) {
            return res.status(404).json({ message: "ID not found in Admin records!" });
        }
        
        if (emp.username) {
            return res.status(400).json({ message: "Account already exists! Please login." });
        }

        // Hash password before saving to the database
        const salt = await bcrypt.genSalt(10);
        emp.username = user;
        emp.password = await bcrypt.hash(pass, salt);
        
        await emp.save();
        res.json({ message: "Account Created Successfully! ✅" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 3. EMPLOYEE LOGIN
exports.employeeLogin = async (req, res) => {
    const { user, pass } = req.body;
    try {
        // Search for user by username
        const found = await User.findOne({ username: user });
        if (!found) {
            return res.status(400).json({ message: "Invalid Employee Credentials!" });
        }

        // Compare the provided password with the hashed password in the DB
        const isMatch = await bcrypt.compare(pass, found.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Employee Credentials!" });
        }

        // Generate a JSON Web Token for the session
        const token = jwt.sign({ id: found._id, role: 'employee' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            message: "Login Successful! 🚀", 
            token, 
            userDetails: {
                id: found.empId,
                name: found.name,
                dept: found.dept
            } 
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};