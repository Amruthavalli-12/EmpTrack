/**
 * API Configuration: Update the BASE_URL to 'api/admin' if your backend 
 * route handlers are defined in the admin router.
 */
const BASE_URL = "http://localhost:5000/api/auth"; 

/**
 * 1. ADMIN LOGIN LOGIC
 * Authenticates administrator credentials and stores the session token.
 */
async function adminLogin() {
    const user = document.getElementById("adminUser").value.trim();
    const pass = document.getElementById("adminPass").value.trim();

    try {
        const response = await fetch(`${BASE_URL}/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Admin Login Successful!");
            // Persist session details in LocalStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", "admin");
            window.location.href = "../admin/dashboard/dashboard.html";
        } else {
            alert(data.message || "Invalid Admin Credentials!");
        }
    } catch (err) {
        alert("Server error. Please verify if the backend service is active.");
    }
}

/**
 * 2. EMPLOYEE REGISTRATION LOGIC
 * Submits new account credentials to the server for verification and storage.
 */
async function registerEmployee() {
    const id = document.getElementById("regID").value.trim();
    const user = document.getElementById("regUser").value.trim();
    const pass = document.getElementById("regPass").value.trim();

    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, user, pass })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Account Created successfully! You may now log in.");
            // Close modal upon successful registration
            document.getElementById('regModal').style.display = 'none';
        } else {
            alert(data.message || "Registration Failed.");
        }
    } catch (err) {
        alert("Registration Failed! System encountered a backend error.");
    }
}

/**
 * 3. EMPLOYEE LOGIN LOGIC
 * Authenticates employee credentials and synchronizes session data for the dashboard.
 */
async function employeeLogin() {
    const user = document.getElementById("empUser").value.trim();
    const pass = document.getElementById("empPass").value.trim();

    try {
        const response = await fetch(`${BASE_URL}/employee-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            
            /**
             * --- DASHBOARD SYNCHRONIZATION ---
             * The Dashboard and Salary modules rely on the 'loggedInEmployee' key.
             * Ensure the backend response includes 'empId', 'name', and 'dept'.
             */
            localStorage.setItem("loggedInEmployee", JSON.stringify(data.userDetails));
            
            // Backup key for legacy component compatibility
            localStorage.setItem("employee", JSON.stringify(data.userDetails));

            alert("Login Successful! Redirecting to dashboard...");
            window.location.href = "../employee/dashboard/dashboard.html";
        } else {
            alert(data.message || "Invalid Credentials! Please try again.");
        }
    } catch (err) {
        alert("Login failed! Please check your network or backend connection.");
    }
}