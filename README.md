# 🚀 EMPTRACK: EMPLOYEE RECORD MANAGEMENT SYSTEM

**EmpTrack** is a robust MERN-stack application designed to automate Human Resource operations. It features a sophisticated **Day-wise Attendance Tracking** system, automated **Payroll Logic**, and real-time **Notification** synchronization. This system bridges the gap between manual record-keeping and digital efficiency.

---

### # 🌟 PROJECT OVERVIEW
Managing a workforce requires precision. **EmpTrack** provides administrators with tools to manage employee lifecycles and payroll, while giving employees a transparent portal to track their attendance via an interactive calendar grid, view shift time-tables, and receive official notifications.

---

### # 🎯 CORE OBJECTIVES
* ✨ **Data Integrity:** Prevent orphan records using Cascade Delete logic.
* ✨ **Attendance Precision:** Track "Present/Absent" status for every individual day.
* ✨ **Financial Automation:** Auto-calculate net salary (₹1000 deduction per absence).
* ✨ **Transparency:** Real-time sync between Admin actions and Employee dashboards.

---

### # 📂 SYSTEM MODULES

## ## ### # 🛠️ ADMIN CONTROL MODULES (MANAGEMENT)

1.  **🔐 Admin Auth & Access:** Secure login for HR/Management to handle sensitive employee data.
2.  **👥 Employee Lifecycle (CRUD):** * **Onboarding:** Add employees with Dept, Designation, and Base Salary.
    * **Cascade Delete Engine:** Deleting an employee automatically wipes their Attendance, Payroll, and Notification history.
3.  **📅 Day-wise Attendance Master:** * **Daily Marking:** Interface to check-off "Present/Absent" for the staff.
    * **Smart Validation:** Prevents duplicate attendance marking for the same date.
4.  **💰 Automated Payroll System:** * **Computation:** $Net Salary = Base Salary - (Total Absents \times 1000)$.
    * **Finalization:** Bulk "Finalize & Pay All" to lock monthly records.
5.  **🕒 Time-Table Management:** Create and update shift timings for different departments.
6.  **📢 Notification Broadcast:** Send official alerts or holiday announcements to all employees instantly.

---

## ## ### # 👤 EMPLOYEE SELF-SERVICE MODULES (USER)

1.  **🔑 Secure Registration:** ID-based registration (Validation ensures only HR-approved IDs can sign up).
2.  **📊 Personal Dashboard:** Real-time summary cards for **Total Present**, **Total Absent**, and **Sundays**.
3.  **🗓️ Interactive Attendance Logs:** * **Visual Calendar Grid:** A 7-column grid showing monthly patterns.
    * **Color Sync:** 🟢 Green (Present), 🔴 Red (Absent), 🟡 Yellow (Sundays).
4.  **📋 Time-Table Access:** Dedicated section to check assigned shifts and work hours.
5.  **📑 Salary Slip & History:** View detailed breakdown of earnings and "Paid/Pending" status.
6.  **🔔 Real-time Notifications:** A notification panel for instant HR updates and alerts.

---

### # 🛠️ TOOLS & TECHNOLOGIES
* **Frontend:** JavaScript (ES6+), HTML5, CSS3 (Modern Glassmorphism UI).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas (Cloud NoSQL).
* **Icons & Fonts:** FontAwesome, Plus Jakarta Sans.

---

### # 📈 PROJECT INSIGHTS & ANALYTICS

* **1. Zero-Error Payroll:** Automating the $Net = Base - (Absents \times 1000)$ formula reduced manual accounting errors by **100%**.
* **2. Data Sanitization:** Implementing `trim()` and `toLowerCase()` logic ensured that search queries for months (e.g., "March 2026") always return accurate results.
* **3. Cascade Integrity:** The system ensures no "junk data" remains in MongoDB after an employee is removed, keeping the cloud storage optimized.

---

### # 🚀 FUTURE SCOPE
🔹 **Biometric Sync:** Integration with fingerprint/face-recognition hardware.
🔹 **Mobile App:** React Native version for on-the-go tracking.

---

### # 👩‍💻 TEAM MEMBERS
* **Mamidi Amruthavalli Supriya(Team Leader)**
* **Mungara Padmavathi**
* **Nadimpilli Shanmukha Simhadri Devi**
* **Parimi Varshitha Devi**

---

### # 🙏 ACKNOWLEDGEMENT
We thank our faculty and institution for their continuous support and guidance in completing this project successfully.

---
