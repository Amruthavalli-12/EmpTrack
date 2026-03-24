const express = require('express');
const router = express.Router();
const { adminLogin, registerEmployee, employeeLogin } = require('../controllers/authController');

// Mapping routes to controller functions
router.post('/admin-login', adminLogin);
router.post('/register', registerEmployee);
router.post('/employee-login', employeeLogin);

module.exports = router;