const API_URL = "http://localhost:5000/api/admin";

/**
 * Fetches and displays the attendance history for the logged-in employee
 * based on the selected month and year filters.
 */
async function loadAttendance() {
    // Retrieve session data from local storage (supporting multiple key possibilities)
    const sessionEmp = JSON.parse(localStorage.getItem("employee")) || 
                      JSON.parse(localStorage.getItem("loggedInEmployee"));
    
    // Safety Check: If no session exists, redirect to login
    if (!sessionEmp || !sessionEmp.empId) {
        alert("Session expired! Please login again.");
        window.location.href = "../../login/login.html";
        return;
    }

    const currentEmpId = sessionEmp.empId;
    const tableBody = document.getElementById("attendance_body");
    
    // Extracting values from the dropdown filters
    const selectedMonth = document.getElementById("monthSelect").value;
    const selectedYear = document.getElementById("yearSelect").value;
    
    // Construct search string (e.g., "March 2026")
    const searchStr = `${selectedMonth} ${selectedYear}`;
    
    const displayMonthEl = document.getElementById("display_month");
    if (displayMonthEl) displayMonthEl.innerText = searchStr;

    try {
        // Fetch all attendance records from the backend
        const response = await fetch(`${API_URL}/get-attendance`);
        const allAttendance = await response.json();

        // Filtering logic: Match Employee ID and the selected Month/Year string
        const myRecords = allAttendance.filter(rec => 
            rec.empId.toString() === currentEmpId.toString() && 
            rec.month.trim() === searchStr.trim()
        );

        tableBody.innerHTML = "";
        let pCount = 0;
        let aCount = 0;

        if (myRecords.length > 0) {
            myRecords.forEach(record => {
                // Assuming data structure contains 'present' and 'absent' counts
                pCount = record.present || 0;
                aCount = record.absent || 0;

                tableBody.innerHTML += `
                    <tr>
                        <td>${record.month}</td>
                        <td>
                            <span class="status-p">Present: ${pCount}</span> | 
                            <span class="status-a">Absent: ${aCount}</span>
                        </td>
                    </tr>`;
            });
        } else {
            // Display empty state if no matching records are found
            tableBody.innerHTML = `<tr><td colspan="2" style="padding:20px; color:#999;">No records found for ${searchStr}.</td></tr>`;
        }
        
        // Update summary boxes
        const presentEl = document.getElementById("total_present");
        const absentEl = document.getElementById("total_absent");
        
        if (presentEl) presentEl.innerText = pCount;
        if (absentEl) absentEl.innerText = aCount;

    } catch (err) {
        console.error("Fetch Error:", err);
        tableBody.innerHTML = "<tr><td colspan='2' style='color:red;'>Server connection failed! Please try again later.</td></tr>";
    }
}