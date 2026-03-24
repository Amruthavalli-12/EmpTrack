// API Base URL for Admin endpoints
const API_URL = "http://localhost:5000/api/admin";

/**
 * Handles the leave application submission
 */
async function applyLeave() {
    const reason = document.getElementById("leaveReason").value;
    const sessionEmp = JSON.parse(localStorage.getItem("employee")) || JSON.parse(localStorage.getItem("loggedInEmployee"));

    // Validation to ensure reason is not empty
    if (!reason) return alert("Please enter a reason for your leave request.");

    const leaveData = {
        empId: sessionEmp.empId,
        name: sessionEmp.name,
        reason: reason,
        status: "Pending" // Initial status set to Pending
    };

    try {
        const res = await fetch(`${API_URL}/apply-leave`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(leaveData)
        });

        if (res.ok) {
            alert("Leave application submitted successfully! Admin will review it shortly.");
            document.getElementById("leaveReason").value = ""; // Clear the input field
            displayMyLeaves(); // Refresh the history table
        }
    } catch (err) { 
        alert("Server Error! Unable to submit request at this time."); 
    }
}

/**
 * Fetches and displays the leave history for the logged-in employee
 */
async function displayMyLeaves() {
    const sessionEmp = JSON.parse(localStorage.getItem("employee")) || JSON.parse(localStorage.getItem("loggedInEmployee"));
    const tbody = document.getElementById("myLeaveStatus");

    if (!sessionEmp) return;

    try {
        const res = await fetch(`${API_URL}/all-leaves`);
        const data = await res.json();
        
        // Filter records to show only those belonging to the current employee
        const myData = data.filter(l => l.empId === sessionEmp.empId);
        tbody.innerHTML = "";

        // Reverse to show the most recent requests at the top
        myData.reverse().forEach(req => {
            const statusClass = req.status.toLowerCase();
            tbody.innerHTML += `
                <tr>
                    <td>${req.reason}</td>
                    <td><span class="status-badge ${statusClass}">${req.status}</span></td>
                </tr>`;
        });
    } catch (err) { 
        console.error("Data Load Error:", err); 
    }
}