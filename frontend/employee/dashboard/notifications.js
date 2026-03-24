/**
 * API Configuration: Ensure this matches your backend server address
 */
const API_URL = "http://localhost:5000/api/admin";

/**
 * Fetches and displays all notifications specifically for the logged-in employee.
 */
async function fetchMyNotifications() {
    // Retrieve employee session from local storage (handles multiple key possibilities)
    const sessionEmp = JSON.parse(localStorage.getItem("employee")) || 
                      JSON.parse(localStorage.getItem("loggedInEmployee"));
    const listDiv = document.getElementById("notifList");

    if (!sessionEmp) return;

    try {
        // Fetch notifications filtered by the current Employee ID
        const response = await fetch(`${API_URL}/get-notifications?empId=${sessionEmp.empId}`);
        const allNotifs = await response.json();

        if (allNotifs.length > 0) {
            listDiv.innerHTML = ""; // Clear existing content or loading state
            allNotifs.forEach(notif => {
                const div = document.createElement("div");
                div.className = "notif-item";
                div.style.position = "relative";

                // Date formatting logic (supports both custom 'date' and MongoDB 'createdAt' fields)
                let rawDate = notif.date || notif.createdAt; 
                let displayDate = rawDate ? new Date(rawDate).toLocaleString('en-IN') : "Recently";

                div.innerHTML = `
                    <button onclick="clearSingleNotif('${notif._id}')" 
                            style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #a3aed0; cursor: pointer; font-size: 18px;">
                        <i class="fas fa-times"></i>
                    </button>
                    <strong>From: Admin 🛡️</strong>
                    <div class="notif-msg">${notif.message}</div>
                    <span class="notif-date">Sent on: ${displayDate}</span>
                `;
                listDiv.appendChild(div);
            }); 
        } else {
            // State for when no notifications exist in the database for this user
            listDiv.innerHTML = `<div class="no-notif">No new messages. 📭</div>`;
        }
    } catch (err) {
        // UI error handling for network or server failures
        listDiv.innerHTML = `<div class="no-notif">Failed to load notifications. ❌</div>`;
    }
}

// --- DELETE NOTIFICATION LOGIC ---
/**
 * Deletes a specific notification from the database and refreshes the UI.
 * Requires a corresponding DELETE route on the backend server.
 * @param {string} notifId - The unique ID of the notification to be removed.
 */
async function clearSingleNotif(notifId) {
    if (!confirm("Are you sure you want to clear this notification?")) return;

    try {
        // API Call: Expects backend to have a route like: router.delete('/clear-notification/:id')
        const response = await fetch(`${API_URL}/clear-notification/${notifId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Re-fetch list to ensure UI matches the database state
            fetchMyNotifications(); 
        } else {
            alert("Error: The request reached the server, but the deletion failed.");
        }
    } catch (err) {
        alert("Server error! Please check your connection.");
    }
}