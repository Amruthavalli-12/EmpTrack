const API_URL = "http://localhost:5000/api/admin";

// Fetches notifications as soon as the page loads
window.onload = loadNotifications;

// --- 1. LOAD NOTIFICATIONS (Date & Time Logic) ---
async function loadNotifications() {
    const listDiv = document.getElementById("notifList");
    if (!listDiv) return;

    try {
        const response = await fetch(`${API_URL}/get-notifications`);
        const notifications = await response.json();

        // Displays a message if the list is empty
        listDiv.innerHTML = notifications.length === 0 ? 
            "<p style='text-align:center; color:#888;'>No recent broadcasts found.</p>" : "";

        // Reversing the array so that new notifications appear at the top
        notifications.reverse().forEach(n => {
            // Use the date strictly from the database for consistency
            const d = new Date(n.date || n.createdAt);
            
            // Format: "22 Mar | 08:30 AM"
            const displayDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            const displayTime = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

            listDiv.innerHTML += `
                <div class="notif-item" style="border-left: 5px solid ${n.priority === 'high' ? '#ee5d50' : '#4318ff'}; padding:15px; margin-bottom:12px; background:#fff; border-radius:15px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="background:#f4f7fe; color:#4318ff; padding:4px 10px; border-radius:8px; font-size:11px; font-weight:800; text-transform:uppercase;">${n.dept}</span>
                        <span style="font-size:11px; color:#a3aed0; font-weight:600;">${displayDate} | ${displayTime}</span>
                    </div>
                    <p style="margin:0; color:#1b2559; font-weight:500; line-height:1.4;">${n.message}</p>
                    <div style="display:flex; justify-content:flex-end; margin-top:10px;">
                        <button onclick="deleteNotif('${n._id}')" style="background:none; border:none; color:#ee5d50; cursor:pointer; font-size:11px; font-weight:700;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error("Load error:", err);
    }
}

// --- 2. SEND NOTIFICATION ---
async function sendNotification() {
    const notifDept = document.getElementById("notifDept").value;
    const notifMsg = document.getElementById("notifMsg").value;
    const notifPriority = document.getElementById("notifPriority").value;

    if (!notifMsg) return alert("Please type a message before sending!");

    try {
        const response = await fetch(`${API_URL}/send-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                notifDept: notifDept, 
                notifMsg: notifMsg, 
                notifPriority: notifPriority 
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Broadcast Sent! 🚀");
            document.getElementById("notifMsg").value = ""; // Clear the text area
            loadNotifications(); // Refresh the list
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        alert("Server connection failed!");
    }
}

// --- 3. DELETE SINGLE NOTIFICATION ---
async function deleteNotif(id) {
    if(!confirm("Are you sure you want to delete this notification?")) return;
    try {
        const response = await fetch(`${API_URL}/delete-notification/${id}`, { method: 'DELETE' });
        if(response.ok) {
            loadNotifications();
        }
    } catch (err) {
        alert("Delete operation failed");
    }
}

// --- 4. CLEAR ALL NOTIFICATIONS ---
async function clearAllNotifications() {
    if (!confirm("Click OK to confirm deleting all broadcast history!")) return;

    try {
        const response = await fetch(`${API_URL}/clear-notifications`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            loadNotifications();
        } else {
            alert("Failed: " + result.message);
        }
    } catch (err) {
        console.error("Clear error:", err);
        alert("Server connection failed!");
    }
}