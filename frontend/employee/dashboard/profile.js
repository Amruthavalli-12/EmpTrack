/**
 * API Configuration: Ensure the backend port matches your server setup.
 */
const API_URL = "http://localhost:5000/api/admin";

window.onload = function() {
    fetchProfileFromDB();
};

// --- 1. DATA RETRIEVAL LOGIC ---
/**
 * Fetches the latest employee profile details from the database 
 * and populates the form fields.
 */
async function fetchProfileFromDB() {
    const sessionData = JSON.parse(localStorage.getItem("loggedInEmployee"));
    if (!sessionData) return;

    const empId = sessionData.empId || sessionData.id;

    try {
        const res = await fetch(`${API_URL}/all-employees`);
        const employees = await res.json();
        const emp = employees.find(e => e.empId === empId);

        if (emp) {
            // Mapping database fields to UI input elements
            document.getElementById("p_name").value = emp.name || "";
            document.getElementById("p_id").value = emp.empId || "";
            
            // Sync Department dropdown with the short-code stored in DB (e.g., AIML, DS)
            if (emp.dept) {
                document.getElementById("p_dept").value = emp.dept;
            }
            
            document.getElementById("p_role").value = emp.designation || "";
            document.getElementById("p_edu").value = emp.education || "";
            document.getElementById("p_gender").value = emp.gender || "Male";
            
            // Update Profile Image UI
            const profileImg = document.getElementById("display_img");
            profileImg.src = emp.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        }
    } catch (err) {
        console.error("Profile Fetch Error:", err);
    }
}

// --- 2. PROFILE UPDATE LOGIC ---
/**
 * Collects updated form data and sends a PUT request to the server.
 * Also synchronizes the parent dashboard header to reflect changes immediately.
 */
async function saveProfileChanges() {
    const sessionEmp = JSON.parse(localStorage.getItem("loggedInEmployee"));
    if (!sessionEmp) return alert("Session Expired! Please login again.");

    const empId = sessionEmp.empId || sessionEmp.id;

    const updatedData = {
        name: document.getElementById("p_name").value,
        dept: document.getElementById("p_dept").value,
        designation: document.getElementById("p_role").value,
        education: document.getElementById("p_edu").value,
        gender: document.getElementById("p_gender").value
    };

    try {
        const res = await fetch(`${API_URL}/update-profile/${empId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (res.ok) {
            alert("Profile updated successfully! ✅");
            
            // --- UI SYNCHRONIZATION ---
            // 1. Update LocalStorage to keep session data consistent
            const newSession = { ...sessionEmp, ...updatedData };
            localStorage.setItem("loggedInEmployee", JSON.stringify(newSession));
            
            // 2. Immediate Dashboard Header Sync (If running inside an iframe)
            if (window.parent) {
                const parentDoc = window.parent.document;
                const userDisplay = parentDoc.getElementById("user_display");
                if (userDisplay) {
                    userDisplay.innerText = updatedData.name;
                }
            }
            
            // Refresh current page to finalize visual state
            location.reload(); 
        } else {
            alert("Failed to save changes. Please try again. ❌");
        }
    } catch (err) {
        console.error("Update Error:", err);
        alert("Server connection error! Please try again later.");
    }
}

// --- 3. IMAGE UPLOAD & PERSISTENCE ---
/**
 * Processes the selected image file, converts it to Base64, 
 * and updates both the UI and the database.
 */
async function uploadAndSaveImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function() {
        const base64Image = reader.result;
        
        // 1. Instant UI preview
        document.getElementById("display_img").src = base64Image;

        const sessionData = JSON.parse(localStorage.getItem("loggedInEmployee"));
        const empId = sessionData.empId || sessionData.id;

        try {
            // Update the profile picture in the database
            const res = await fetch(`${API_URL}/update-profile/${empId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profilePic: base64Image })
            });

            if (res.ok) {
                // 2. Sync Dashboard Header Image
                if (window.parent) {
                    const headerImg = window.parent.document.getElementById("header_user_img");
                    if (headerImg) {
                        headerImg.src = base64Image;
                    }
                }

                // 3. Update current LocalStorage session
                sessionData.profilePic = base64Image;
                localStorage.setItem("loggedInEmployee", JSON.stringify(sessionData));

                alert("Profile picture updated successfully! ✅");
            }
        } catch (err) {
            console.error("Image Upload Error:", err);
            alert("Failed to upload image. Server error.");
        }
    };
    reader.readAsDataURL(file);
}