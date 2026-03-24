const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// --- 1. EMPLOYEE MANAGEMENT ---
router.post('/add-employee', adminController.addEmployee);
router.get('/all-employees', adminController.getAllEmployees);
router.delete('/delete-employee/:id', adminController.deleteEmployee);

// NEWLY ADDED ROUTE: For employee profile updates
router.get('/all-employees', adminController.getAllEmployees);

// --- 2. ATTENDANCE & LEAVES ---
router.post('/mark-attendance', adminController.markAttendance);
router.get('/get-attendance', adminController.getAttendanceReport);
router.post('/apply-leave', adminController.applyLeave);
router.get('/all-leaves', adminController.getAllLeaves);
router.put('/update-leave-status', adminController.updateLeaveStatus);

// --- UPDATE ROUTE ---
// This route handles requests from frontend: update-employee/${idValue}
router.put('/update-employee/:id', adminController.updateEmployee);

// --- 3. NOTIFICATION SYSTEM ---
router.post('/send-notification', adminController.sendNotification);
router.get('/get-notifications', adminController.getNotifications);
router.delete('/delete-notification/:id', adminController.deleteNotification);

// Naming match fix for clear notification functionality
router.delete('/clear-notification/:id', adminController.clearNotification); 
router.delete('/clear-notifications', adminController.clearAllNotifications);

// --- 4. PAYROLL & SALARY ---
router.post('/finalize-payroll', adminController.finalizePayroll);
router.get('/payroll-history', adminController.getPayrollHistory);
router.post('/credit-salary', adminController.creditSalary);

// --- 5. AUTHENTICATION & SECURITY ---
router.post('/register-employee', adminController.registerEmployee);
router.post('/employee-login', adminController.employeeLogin);
router.post('/reset-password', adminController.resetPassword);

// Delete Payroll Route
router.delete('/delete-payroll-record/:id', adminController.deletePayrollRecord);

// Using PUT method to update profile details
router.put('/update-profile/:id', adminController.updateProfile);

// --- 6. TIMETABLE MANAGEMENT ---
router.get('/get-timetable', adminController.getEmployeeTimeTable);

// POST request - To add new schedule data
router.post('/add-timetable', adminController.addTimeTable);

// Route to fetch all schedules
router.get('/get-all-timetables', adminController.getAllSchedules);

// Route to delete a specific schedule
router.delete('/delete-timetable/:id', adminController.deleteSchedule);

module.exports = router;