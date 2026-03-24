/**
 * Handles the Employee Account Registration process.
 * Verifies if the Employee ID was pre-authorized by the Admin before 
 * allowing the user to create a username and password.
 */
function registerEmployeeAccount() {
    // Collect and trim user input to prevent whitespace errors
    const empID = document.getElementById("regEmpID").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    // Basic validation to ensure no fields are left empty
    if (!empID || !username || !password) {
        alert("Registration Error: All fields are mandatory!");
        return;
    }

    // 1. Retrieve the master employee list authorized by the Admin
    let employees = JSON.parse(localStorage.getItem("employeesData")) || [];

    // 2. Locate the employee record using the provided ID
    const empIndex = employees.findIndex(emp => emp.id === empID);

    if (empIndex === -1) {
        // Condition: The ID does not exist in the Admin-provided records
        alert("Registration Failed: Employee ID not recognized. Please contact your Admin for authorization.");
        return;
    }

    // 3. Prevent duplicate registrations for the same ID
    if (employees[empIndex].username) {
        alert("Account already exists for this ID! Redirecting to the Login page.");
        window.location.href = "login.html";
        return;
    }

    // 4. Finalize the account setup
    // Merges the new credentials (username/password) with existing data (ID, name, dept)
    employees[empIndex].username = username;
    employees[empIndex].password = password;

    // 5. Commit the updated employee record back to LocalStorage
    localStorage.setItem("employeesData", JSON.stringify(employees));

    alert("Registration Successful! Your account has been created. Redirecting to login...");
    
    // 6. Redirect to the Login Page for authentication
    window.location.href = "login.html";
}