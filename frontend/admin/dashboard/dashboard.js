const API_URL = "http://localhost:5000/api/admin";

// --- SECURITY CHECK & DATA LOAD ---
window.onload = async function() {
    let role = localStorage.getItem("role");
    if (role !== "admin") {
        alert("Access Denied! Please login as Admin.");
        window.location.href = "../../login/login.html";
        return;
    }

    // Loading statistics from the database
    await loadDashboardStats();
    
    // Dashboard table loading logic (Only executes if facultyBody element exists)
    if (document.getElementById('facultyBody')) {
        await loadFacultyTable();
    }
};

// --- 1. DASHBOARD STATS LOGIC ---
async function loadDashboardStats() {
    try {
        const empRes = await fetch(`${API_URL}/all-employees`);
        const employees = await empRes.json();
        
        if (document.getElementById("totalEmployees")) {
            document.getElementById("totalEmployees").innerText = employees.length;
        }

        const attRes = await fetch(`${API_URL}/get-attendance`); 
        const attendanceRecords = await attRes.json();

        const today = new Date().toISOString().split('T')[0];
        const todayRecords = attendanceRecords.filter(rec => rec.date && rec.date.startsWith(today));

        const presentCount = todayRecords.filter(rec => rec.status === "Present").length;
        const absentCount = employees.length - presentCount;

        if (document.getElementById("stat-present")) document.getElementById("stat-present").innerText = presentCount;
        if (document.getElementById("stat-absent")) document.getElementById("stat-absent").innerText = absentCount > 0 ? absentCount : 0;

        const notifRes = await fetch(`${API_URL}/get-notifications`);
        const notifications = await notifRes.json();
        if (document.getElementById("totalNotifications")) {
            document.getElementById("totalNotifications").innerText = notifications.length;
        }

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
    }
}

// --- 2. FACULTY TABLE LOGIC ---
async function loadFacultyTable() {
    const tableBody = document.getElementById('facultyBody');
    if (!tableBody) return;

    try {
        const res = await fetch(`${API_URL}/all-employees`);
        const employees = await res.json();
        tableBody.innerHTML = ""; 

        employees.forEach(emp => {
            const nameParts = emp.name ? emp.name.split(' ') : ['E'];
            const initials = nameParts.length > 1 
                ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase() 
                : nameParts[0][0].toUpperCase();

            const statusClass = emp.status === "On Leave" ? "leave-status" : "active-status";

            const row = `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div class="initials-icon" style="background: var(--accent-indigo); color: white; width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;">
                                ${initials}
                            </div>
                            <span style="font-weight: 700;">${emp.name}</span>
                        </div>
                    </td>
                    <td>${emp.empId || 'N/A'}</td> 
                    <td>${emp.dept || 'General'}</td> 
                    <td>${emp.designation || 'Staff'}</td> 
                    <td><span class="status-pill ${statusClass}">${emp.status || 'Active'}</span></td>
                    <td><i class="fas fa-ellipsis-h" style="color: var(--text-grey); cursor: pointer;"></i></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (err) {
        console.error("Table Load Error:", err);
    }
}

// --- 3. NAVIGATION LOGIC ---
function changePage(url, element) {
    // Direct redirection logic based on existing project structure
    window.location.href = url;

    // Sidebar Active Class Update
    if (element) {
        document.querySelectorAll('.module-item').forEach(item => item.classList.remove('active'));
        element.classList.add('active');
    }
}

// --- 4. MODULE OPEN FUNCTIONS ---
function openEmployee() { window.location.href = "../employees/employeeList.html"; }
function openAttendance() { window.location.href = "../attendance/attendance.html"; }
function openLeave() { window.location.href = "../attendance/leaveManagement.html"; }
function openPayroll() { window.location.href = "../payroll/payroll.html"; }
function openReports() { window.location.href = "../reports/reports.html"; }
function openNotifications() { window.location.href = "../notifications/notifications.html"; }

// TIME TABLE MODULE
function openTimetable(element) {
    window.location.href = "add_timetable.html";
}

// --- 5. LOGOUT LOGIC ---
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear();
        window.location.href = "../../login/login.html";
    }
}