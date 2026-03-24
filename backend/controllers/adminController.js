// --- 1. MODELS IMPORT ---
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const Payroll = require('../models/Payroll');
const Leave = require('../models/Leave');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const TimeTable = require('../models/TimeTable');

// --- EMPLOYEE MANAGEMENT ---

// --- ADD EMPLOYEE CONTROLLER ---
exports.addEmployee = async (req, res) => {
    try {
        // 1. Collecting data from request body
        const { id, empId, name, dept, designation, education, salary } = req.body;
        
        // Handle both 'id' or 'empId' from frontend
        const finalId = id || empId;

        // 2. Mandatory validation
        if (!finalId || !name) {
            return res.status(400).json({ message: "Employee ID and Name are mandatory!" });
        }

        // 3. Check if Employee ID already exists in Database
        const existingUser = await User.findOne({ empId: finalId });
        if (existingUser) {
            return res.status(400).json({ message: "An employee with this ID already exists! ❌" });
        }

        // 4. Create new User record
        // NOTE: Username and Password default to ID (until registration)
        const newUser = new User({
            empId: finalId,
            name: name,
            dept: dept,
            designation: designation || "N/A",
            education: education || "N/A",
            salary: salary || 0,
            role: 'employee',
            username: `user_${finalId}`, // Default username
            password: `pass_${finalId}`   // Default password
        });

        // 5. Save to MongoDB
        await newUser.save();

        // 6. Success Response
        res.status(200).json({ 
            message: "Employee added successfully to MongoDB! ✅",
            employee: newUser 
        });

    } catch (err) {
        console.error("Mongoose Save Error:", err);
        res.status(500).json({ 
            message: "Database Error: " + err.message, 
            error: err 
        });
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        // Fetching all users with 'employee' role
        const employees = await User.find({ role: 'employee' });
        res.json(employees);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ message: "Error fetching employees" });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        await User.findOneAndDelete({ empId: req.params.id });
        res.json({ message: "Employee Deleted Successfully! 🗑️" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting employee" });
    }
};

// --- UPDATE EMPLOYEE LOGIC ---
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params; 
        const { name, dept, designation, education, salary } = req.body;

        // Updating record matching the empId
        const updatedEmployee = await User.findOneAndUpdate(
            { empId: id }, 
            { 
                $set: { 
                    name, 
                    dept, 
                    designation, 
                    education, 
                    salary 
                } 
            },
            { new: true } // Returns the updated document
        );

        if (!updatedEmployee) {
            return res.status(404).json({ message: "Employee not found! ❌" });
        }

        res.status(200).json({ 
            message: "Employee details updated successfully! ✅", 
            employee: updatedEmployee 
        });

    } catch (err) {
        console.error("Update Database Error:", err);
        res.status(500).json({ message: "Database Error: " + err.message });
    }
};

// --- ATTENDANCE & LEAVE MANAGEMENT ---

exports.markAttendance = async (req, res) => {
    try {
        const { records } = req.body; 
        if (!records || records.length === 0) return res.status(400).json({ message: "No records received" });

        // 1. Create date range for today (Start to End)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        // 2. Check if attendance was already marked today
        const alreadyMarked = await Attendance.findOne({
            updatedAt: { $gte: startOfToday, $lte: endOfToday }
        });

        if (alreadyMarked) {
            return res.status(400).json({ message: "Attendance has already been marked for today! ❌" });
        }

        // 3. Update or Insert attendance records
        for (let record of records) {
            await Attendance.findOneAndUpdate(
                { empId: record.empId, month: record.month },
                { $inc: record.status === 'present' ? { present: 1 } : { absent: 1 } },
                { upsert: true, new: true }
            );
        }

        res.json({ message: "Attendance recorded successfully! ✅" });

    } catch (err) {
        console.error("Attendance Error:", err);
        res.status(500).json({ message: "Database error", error: err.message });
    }
};

exports.getAttendanceReport = async (req, res) => {
    try {
        const reports = await Attendance.find().lean();
        const fullReports = await Promise.all(reports.map(async (rec) => {
            const user = await User.findOne({ empId: rec.empId });
            return {
                empId: rec.empId,
                month: rec.month,
                present: rec.present,
                absent: rec.absent,
                name: user ? user.name : "Unknown",
                dept: user ? user.dept : "N/A",
                salary: user ? user.salary : 0 
            };
        }));
        res.json(fullReports);
    } catch (err) {
        res.status(500).json({ message: "Error fetching report" });
    }
};

// --- AUTHENTICATION (LOGIN/REGISTER/RESET) ---

exports.registerEmployee = async (req, res) => {
    const { id, username, password } = req.body;
    try {
        let emp = await User.findOne({ empId: id });
        if (!emp) return res.status(404).json({ message: "ID not found in records" });
        emp.username = username;
        emp.password = password; 
        await emp.save();
        res.json({ message: "Registered successfully! ✅" });
    } catch (err) {
        res.status(500).json({ message: "Registration Error" });
    }
};

exports.employeeLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const emp = await User.findOne({ username });
        if (!emp) {
            return res.status(401).json({ message: "Invalid credentials! ❌" });
        }

        // Hashed password verification
        const isMatch = await bcrypt.compare(password, emp.password);
        
        // Fallback for plain text passwords if necessary
        if (!isMatch && password !== emp.password) {
            return res.status(401).json({ message: "Invalid credentials! ❌" });
        }

        return res.json({ 
            employee: { 
                empId: emp.empId, 
                name: emp.name, 
                role: emp.role,
            } 
        });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Server error during login." });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { id, username, newPass } = req.body;

        // Find user by empId and username
        const employee = await User.findOne({ empId: id, username: username });

        if (!employee) {
            return res.status(404).json({ message: "Invalid Employee ID or Username combination!" });
        }

        employee.password = newPass;
        await employee.save();

        res.status(200).json({ message: "Password updated successfully! ✅" });
    } catch (err) {
        console.error("Reset Error:", err); 
        res.status(500).json({ message: "Server error during password reset." });
    }
};

// --- NOTIFICATION SYSTEM ---

exports.sendNotification = async (req, res) => {
    try {
        const { notifDept, notifMsg, notifPriority } = req.body;
        if (!notifMsg) return res.status(400).json({ message: "Message is required!" });

        const newNotif = new Notification({
            dept: notifDept,
            message: notifMsg, 
            priority: notifPriority,
            date: new Date()   
        });

        await newNotif.save();
        res.status(200).json({ message: "Notification Sent Successfully! ✅" });
    } catch (err) {
        res.status(500).json({ message: "Failed to send", error: err.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ _id: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Fetch Error" });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Notification Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete Error" });
    }
};

exports.clearNotification = async (req, res) => {
    try {
        const { id } = req.params; 
        const deleted = await Notification.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Notification not found" });
        res.status(200).json({ message: "Notification cleared! 🗑️" });
    } catch (err) {
        res.status(500).json({ message: "Clear Error: " + err.message });
    }
};

exports.clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({}); 
        res.status(200).json({ message: "All notifications cleared! 🗑️" });
    } catch (err) {
        res.status(500).json({ message: "Clear Error" });
    }
};

// --- PAYROLL & LEAVE ---

exports.finalizePayroll = async (req, res) => {
    try {
        const { month, records } = req.body;

        if (!month || !records || records.length === 0) {
            return res.status(400).json({ message: "Incomplete data provided! ⚠️" });
        }

        // --- DOUBLE ENTRY CHECK ---
        // Verify if payroll for this month has already been finalized
        const alreadyPaid = await Payroll.findOne({ month: month });

        if (alreadyPaid) {
            return res.status(400).json({ 
                message: `Payroll for ${month} has already been processed. You cannot process it again! ❌` 
            });
        }

        // Add month and date to records for bulk insert
        const recordsWithMonth = records.map(r => ({
            ...r,
            month: month,
            date: new Date() 
        }));

        await Payroll.insertMany(recordsWithMonth);

        res.status(200).json({ message: `Payroll Finalized for ${month}! ✅` });

    } catch (err) {
        console.error("Payroll Save Error:", err);
        res.status(500).json({ message: "Database Error: " + err.message });
    }
};

exports.getPayrollHistory = async (req, res) => {
    try {
        const history = await Payroll.find().sort({ _id: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: "Error fetching payroll history" });
    }
};

exports.applyLeave = async (req, res) => {
    try {
        const newLeave = new Leave(req.body);
        await newLeave.save();
        res.status(200).json({ message: "Leave applied!" });
    } catch (err) { res.status(500).json({ error: "Apply Failed" }); }
};

exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().sort({ _id: -1 });
        res.status(200).json(leaves);
    } catch (err) { res.status(500).json({ error: "Fetch Failed" }); }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        const updatedLeave = await Leave.findByIdAndUpdate(id, { status: status }, { new: true });
        if (!updatedLeave) return res.status(404).json({ message: "Record not found" });
        res.status(200).json({ message: `Leave ${status} successfully! ✅` });
    } catch (err) {
        res.status(500).json({ error: "Update Failed" });
    }
};

exports.creditSalary = async (req, res) => {
    try {
        const newSalary = new Payroll(req.body); 
        await newSalary.save();
        res.status(200).json({ message: "Salary Credited Successfully! 💰" });
    } catch (err) { res.status(500).json({ error: "Credit Failed" }); }
};

exports.deletePayrollRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await Payroll.findByIdAndDelete(id);
        res.status(200).json({ message: "Salary record deleted successfully! 🗑️" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed: " + err.message });
    }
};

// --- PROFILE MANAGEMENT ---

exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, dept, designation, education, gender, profilePic } = req.body;

        const updatedEmployee = await User.findOneAndUpdate(
            { empId: id }, 
            { 
                $set: { 
                    name, 
                    dept, 
                    designation, 
                    education, 
                    gender,    
                    profilePic 
                } 
            },
            { returnDocument: 'after' } 
        );

        if (!updatedEmployee) return res.status(404).json({ message: "User not found!" });
        res.status(200).json({ message: "Updated! ✅", employee: updatedEmployee });
    } catch (err) {
        res.status(500).json({ message: "Error: " + err.message });
    }
};

// --- TIME TABLE MANAGEMENT ---

// 1. Save Schedule (Admin Side)
exports.addTimeTable = async (req, res) => {
    try {
        const newEntry = new TimeTable(req.body);
        await newEntry.save();
        res.status(201).json({ message: "Saved! ✅" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Get Filtered Schedule (Employee Side)
exports.getEmployeeTimeTable = async (req, res) => {
    try {
        const { dept } = req.query; 
        const schedule = await TimeTable.find({ dept: dept }).sort({ day: 1 });
        res.status(200).json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Delete Schedule (Admin Side)
exports.deleteSchedule = async (req, res) => {
    try {
        await TimeTable.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted! 🗑️" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. Get All Schedules (Admin View)
exports.getAllSchedules = async (req, res) => {
    try {
        const schedules = await TimeTable.find().sort({ createdAt: -1 }); 
        res.status(200).json(schedules);
    } catch (err) {
        res.status(500).json({ message: "Error: " + err.message });
    }
};