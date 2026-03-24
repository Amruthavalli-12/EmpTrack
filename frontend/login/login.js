/**
 * Backend Configuration: 
 * Ensure the server is active on localhost:5000/api/admin before making requests.
 */
const API_URL = "http://localhost:5000/api/admin";

/**
 * 1. ADMIN LOGIN
 * Authenticates the administrator using a static verification system.
 * This can be transitioned to an API call in the future if a database is required.
 */
function adminLogin() {
    const user = document.getElementById("adminUser").value.trim();
    const pass = document.getElementById("adminPass").value.trim();
    
    // Static validation for administrative access
    if (user === "admin" && pass === "admin123") {
        localStorage.setItem("role", "admin");
        alert("Admin Login Successful! ✅");
        window.location.href = "../admin/dashboard/dashboard.html";
    } else { 
        alert("Invalid Admin Credentials. Please try again. ❌"); 
    }
}

/**
 * 2. EMPLOYEE REGISTRATION
 * Submits employee data (ID, Username, Password) to the backend for new account creation.
 */
async function registerEmployee() {
    const id = document.getElementById("regID").value.trim();
    const user = document.getElementById("regUser").value.trim();
    const pass = document.getElementById("regPass").value.trim();

    // Field validation
    if (!id || !user || !pass) {
        alert("Registration Error: All fields are mandatory.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register-employee`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, username: user, password: pass })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Account Created Successfully! You may now log in. ✅");
            closeAllModals(); // Close registration interface
        } else {
            alert("Registration Failed: " + (result.message || "Unknown error occurred."));
        }
    } catch (err) {
        console.error("Connection Error:", err);
        alert("Server Connectivity Error: Please ensure the backend service is running.");
    }
}

/**
 * 3. EMPLOYEE LOGIN
 * Authenticates employee credentials and synchronizes user data for the Dashboard and Salary modules.
 */
async function employeeLogin() {
    const user = document.getElementById("empUser").value.trim();
    const pass = document.getElementById("empPass").value.trim();

    if (!user || !pass) {
        alert("Action Required: Please enter your username and password.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/employee-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem("role", "employee");
            
            /**
             * Data Synchronization:
             * Stores employee details under 'loggedInEmployee' for cross-module consistency.
             */
            localStorage.setItem("loggedInEmployee", JSON.stringify(result.employee));
            
            alert("Login Successful! Welcome, " + result.employee.name + " 🌟");
            window.location.href = "../employee/dashboard/dashboard.html"; 
        } else {
            alert(result.message || "Authentication Failed: Invalid Employee Credentials. ❌");
        }
    } catch (err) {
        console.error("Login Failure:", err);
        alert("Login failed: Internal server error.");
    }
}

/**
 * 4. PASSWORD RECOVERY (RESET)
 * Verifies identity via Employee ID and Username before updating the password in the database.
 */
async function resetPassword() {
    const id = document.getElementById("forgotID").value.trim();
    const user = document.getElementById("forgotUser").value.trim();
    const newPass = document.getElementById("newPass").value.trim();

    try {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, username: user, newPass: newPass })
        });

        // Error handling for non-JSON responses or server crashes
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend Error Detail:", errorText);
            throw new Error("Internal Server Error occurred during password reset.");
        }

        const result = await response.json();
        alert(result.message || "Password has been updated successfully.");
        closeAllModals();

    } catch (err) {
        console.error("Fetch Exception:", err);
        alert("Recovery Failed: Unable to connect to the server. Check backend status.");
    }
}

/**
 * UI CONTROL: MODAL MANAGEMENT
 * Clears and hides all active modal overlays and registration/recovery panels.
 */
function closeAllModals() {
    // Hide Registration and Forgot Password Modals
    const modals = ['regModal', 'forgotModal', 'overlay'];
    modals.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}