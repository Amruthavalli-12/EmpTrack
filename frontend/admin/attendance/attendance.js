const API_URL = "http://localhost:5000/api/admin";

window.onload = async function () {
    let role = localStorage.getItem("role");
    if (role === "admin") {
        let adminPanel = document.getElementById("markPanel");
        if (adminPanel) adminPanel.style.display = "block";
        await showMarkAttendance(); 
    }
};

// 1. Fetch and display the Employees list in Table format
async function showMarkAttendance() {
    let listBody = document.getElementById("employeeList"); 
    if (!listBody) return;

    try {
        const response = await fetch(`${API_URL}/all-employees`);
        const employees = await response.json();

        listBody.innerHTML = "";
        if (employees.length === 0) {
            listBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>No employees found in Database.</td></tr>";
            return;
        }

        employees.forEach(emp => {
            // Added data-name attribute here to be used during the save process
            let row = `
                <tr>
                    <td style="font-weight: 700;" class="emp-name">${emp.name}</td>
                    <td style="color: var(--text-grey);" class="emp-id">${emp.empId}</td>
                    <td style="text-align: center;">
                        <input type="checkbox" id="att_${emp.empId}" data-name="${emp.name}" checked 
                               style="width: 22px; height: 22px; accent-color: #4318ff; cursor: pointer;">
                    </td>
                </tr>
            `;
            listBody.innerHTML += row;
        });
    } catch (err) {
        console.error("Error fetching employees:", err);
        listBody.innerHTML = "<tr><td colspan='3' style='text-align:center; color:red;'>Failed to load employees.</td></tr>";
    }
}

// 2. Function to Save Attendance
async function saveAttendance() {
    const listBody = document.getElementById("employeeList");
    const checkboxes = listBody.querySelectorAll('input[type="checkbox"]');
    const btn = document.querySelector(".btn-primary"); // Submit Button

    if (checkboxes.length === 0) {
        alert("No employees to mark attendance!");
        return;
    }

    let attendanceRecords = [];
    let currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    checkboxes.forEach(cb => {
        const empId = cb.id.replace('att_', '');
        const empName = cb.getAttribute('data-name'); // Collecting the name as well
        
        attendanceRecords.push({
            empId: empId,
            name: empName,
            month: currentMonth,
            status: cb.checked ? 'present' : 'absent'
        });
    });

    try {
        // Button loading state
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        const response = await fetch(`${API_URL}/mark-attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: attendanceRecords })
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ " + result.message);
            btn.innerText = "Attendance Done ✅";
            btn.style.background = "#05cd99"; // Success Green
        } else {
            alert("⚠️ " + result.message);
            btn.innerText = "Already Marked Today";
            btn.style.background = "#a3aed0";
        }
    } catch (err) {
        console.error(err);
        alert("❌ Server connection error!");
        btn.disabled = false;
        btn.innerText = "Submit Attendance";
    }
}

// 3. Toggle History Section visibility
function toggleHistory() {
    const historyModule = document.getElementById("historyModule");
    if (historyModule) {
        historyModule.style.display = "block";
        historyModule.scrollIntoView({ behavior: 'smooth' });
        
        // Searches for the current month by default
        const monthSelect = document.getElementById("filterMonth");
        if(monthSelect.value) searchHistory();
    }
}

// 4. Search Attendance History
function searchHistory() {
    const monthName = document.getElementById("filterMonth").value; 
    if(!monthName) {
        alert("Please select a month!");
        return;
    }
    const currentYear = new Date().getFullYear(); 
    const fullMonthString = `${monthName} ${currentYear}`;
    
    displayAttendance(fullMonthString);
}

// 5. Render History Table
async function displayAttendance(targetMonth) {
    let tbody = document.getElementById("attendanceBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;"><i class="fas fa-circle-notch fa-spin"></i> Loading Records...</td></tr>`;

    try {
        const response = await fetch(`${API_URL}/get-attendance`);
        const data = await response.json();

        tbody.innerHTML = "";
        // Filtering data for the target month
        const filteredData = data.filter(record => record.month === targetMonth);

        if (filteredData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: #a3aed0;">
                <i class="fas fa-folder-open" style="font-size: 2rem; display:block; margin-bottom:10px;"></i>
                No records found for "${targetMonth}"
            </td></tr>`;
            return;
        }

        filteredData.forEach(record => {
            tbody.innerHTML += `
                <tr>
                    <td><span style="font-weight: 800; color: #4318ff;">#${record.empId}</span></td>
                    <td style="font-weight: 600;">${record.name || 'N/A'}</td>
                    <td>${record.month}</td>
                    <td><span style="color: #05cd99; font-weight: 800;">${record.present}</span></td>
                    <td><span style="color: #ee5d50; font-weight: 800;">${record.absent}</span></td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Load report error:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error loading history!</td></tr>`;
    }
}