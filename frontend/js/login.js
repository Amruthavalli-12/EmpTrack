/**
 * Handles Administrator Authentication.
 * Validates hardcoded credentials and sets session roles in LocalStorage.
 */
function adminLogin() {
    let user = document.getElementById("adminUser").value;
    let pass = document.getElementById("adminPass").value;

    // Standard static validation for Administrator access
    if (user === "admin" && pass === "admin123") {
        // Required for role-based access control and attendance verification
        localStorage.setItem("role", "admin"); 
        localStorage.setItem("currentUser", user);
        
        alert("Admin Login Successful! Redirecting to dashboard...");
        
        // Navigation path relative to the admin/dashboard directory structure
        window.location.href = "../admin/dashboard/dashboard.html"; 
    } else {
        alert("Authentication Failed: Invalid Admin Credentials.");
    }
}

/**
 * Handles Employee Authentication.
 * Searches for matching credentials in the registered employee database.
 */
function employeeLogin() {
    let user = document.getElementById("empUser").value;
    let pass = document.getElementById("empPass").value;

    // Retrieve registered employee data from LocalStorage
    let employees = JSON.parse(localStorage.getItem("employeesData")) || [];
    let foundEmp = employees.find(e => e.username === user && e.password === pass);

    if (foundEmp) {
        localStorage.setItem("role", "employee");
        localStorage.setItem("currentUser", user);

        /**
         * --- CRITICAL DATA SYNCHRONIZATION ---
         * 'loggedInUser' must be set to ensure the Profile and Dashboard pages
         * can retrieve and display the correct employee data.
         */
        localStorage.setItem("loggedInUser", JSON.stringify(foundEmp)); 

        alert("Employee Login Successful! Redirecting...");
        window.location.href = "../employee/dashboard/dashboard.html";
    } else {
        alert("Authentication Failed: Invalid Employee Credentials.");
    }
}