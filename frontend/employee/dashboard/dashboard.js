/**
 * API Configuration (Verify backend port matches)
 */
const API_URL = "http://localhost:5000/api/admin";

// --- 1. PAGE LOAD INITIALIZATION ---
window.onload = function() {
    loadDashboard();
    loadMiniNotifications();
};

// --- 2. DASHBOARD DATA SYNC (Name, ID, Photo) ---
/**
 * Synchronizes dashboard UI with the latest employee data from the database.
 */
async function loadDashboard() {
    const sessionData = localStorage.getItem("loggedInEmployee");
    if (!sessionData) {
        // Redirect to login if no session is found
        window.location.href = "../../login/login.html"; 
        return;
    }

    const empSession = JSON.parse(sessionData);
    const defaultIcon = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    const empId = empSession.empId || empSession.id;

    try {
        // Fetch fresh data directly from the database to ensure UI is up-to-date
        const response = await fetch(`${API_URL}/all-employees`);
        const employees = await response.json();
        const emp = employees.find(e => e.empId === empId) || empSession;

        // --- PHOTO SYNCHRONIZATION ---
        const headerImg = document.getElementById("header_user_img");
        if (headerImg) {
            // Check both new (profilePic) and legacy (profileImage) fields
            headerImg.src = emp.profilePic || emp.profileImage || defaultIcon;
        }

        // --- NAME & ID SYNCHRONIZATION ---
        const userDisplay = document.getElementById("user_display");
        if (userDisplay) {
            userDisplay.innerText = emp.name || "User";
        }
        
        const empIdDisplay = document.getElementById("emp_id_display");
        if (empIdDisplay) {
            empIdDisplay.innerText = "ID: " + (emp.empId || emp.id || "--");
        }

        // Update local storage to keep session data fresh for other modules
        localStorage.setItem("loggedInEmployee", JSON.stringify(emp));

    } catch (err) {
        console.error("Dashboard DB Sync Error:", err);
        // Fallback: Display existing session data in case of fetch failure
        const headerImg = document.getElementById("header_user_img");
        if (headerImg) {
            headerImg.src = empSession.profilePic || empSession.profileImage || defaultIcon;
        }
    }
}

// --- 3. CROSS-TAB STORAGE EVENT LISTENER ---
/**
 * Updates UI in real-time if employee data is changed in another tab.
 */
window.addEventListener('storage', (e) => {
    if (e.key === 'loggedInEmployee' && e.newValue) {
        const updated = JSON.parse(e.newValue);
        if (updated) {
            const userDisplay = document.getElementById("user_display");
            if (userDisplay) userDisplay.innerText = updated.name;
            
            const newImg = updated.profilePic || updated.profileImage;
            const headerImg = document.getElementById("header_user_img");
            if (newImg && headerImg) {
                headerImg.src = newImg;
            }
        }
    }
});

// --- 4. NOTIFICATION LOGIC ---
/**
 * Toggles the visibility of the notification dropdown.
 */
function toggleNotifDropdown() {
    const dropdown = document.getElementById("notifDropdown");
    if (dropdown) {
        dropdown.style.display = (dropdown.style.display === "none" || dropdown.style.display === "") ? "block" : "none";
    }
}

/**
 * Fetches and displays the 3 most recent notifications for the logged-in user.
 */
async function loadMiniNotifications() {
    const sessionData = localStorage.getItem("loggedInEmployee");
    if (!sessionData) return;
    
    const emp = JSON.parse(sessionData);
    const list = document.getElementById("miniNotifList");
    const badge = document.getElementById("notifBadge");

    try {
        const response = await fetch(`${API_URL}/get-notifications?empId=${emp.empId}`);
        const notifs = await response.json();

        if (notifs && notifs.length > 0) {
            if (badge) badge.style.display = "block";
            if (list) {
                list.innerHTML = "";
                notifs.slice(0, 3).forEach(n => {
                    list.innerHTML += `
                        <div style="padding: 12px; border-bottom: 1px solid #f1f4f9; margin-bottom: 5px; border-radius:10px; background: #fcfdfe;">
                            <p style="margin: 0; font-size: 13px; font-weight: 700; color: #1b2559;">${n.message.substring(0, 45)}...</p>
                            <span style="font-size: 10px; color: #a3aed0; display:block; margin-top:5px;">
                                <i class="far fa-clock"></i> ${new Date(n.date || n.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    `;
                });
            }
        } else {
            if (badge) badge.style.display = "none";
            if (list) list.innerHTML = "<p style='text-align:center; color:#a3aed0; font-size:12px; padding:20px;'>No new alerts 📭</p>";
        }
    } catch (err) {
        console.error("Notification Loading Error:", err);
    }
}

// --- 5. NAVIGATION & IFRAME CONTROL ---
/**
 * Changes the active page in the main content iframe and updates the breadcrumb.
 */
function changePage(url, element) {
    const iframe = document.getElementById('contentView');
    const breadcrumb = document.getElementById('breadcrumb');
    
    if (!iframe) return;
    
    // Use location.replace to avoid clogging browser history
    iframe.contentWindow.location.replace(url);

    if (breadcrumb) {
        let title = url.split('.')[0]; 
        breadcrumb.innerText = title.charAt(0).toUpperCase() + title.slice(1);
    }
    
    // Update active visual state for navigation items
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }
}

/**
 * Navigates to the profile management page.
 */
function openProfile() {
    changePage('profile.html', null);
}

/**
 * Close notification dropdown when clicking outside the notification wrapper.
 */
window.onclick = function(event) {
    if (!event.target.closest('.notif-wrapper')) {
        const dropdown = document.getElementById("notifDropdown");
        if (dropdown) dropdown.style.display = "none";
    }
}

// --- 6. LOGOUT SYSTEM ---
/**
 * Clears session data and redirects the user to the login screen.
 */
function logout() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("loggedInEmployee");
        window.location.href = "../../login/login.html";
    }
}