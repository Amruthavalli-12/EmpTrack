/**
 * API Configuration: Ensure the backend server is running on the specified port.
 */
const API_URL = "http://localhost:5000/api/admin";

/**
 * Handles the Employee Registration process by sending credentials 
 * to the backend database via a POST request.
 */
async function registerEmployeeAccount() {
    const empId = document.getElementById("regEmpID").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    // Basic validation to ensure all input fields are filled
    if (!empId || !username || !password) {
        alert("Registration Error: All fields are mandatory!");
        return;
    }

    try {
        // Sending registration data to the backend API
        const response = await fetch(`${API_URL}/register-employee`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ empId, username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Success: Account created or linked successfully
            alert(data.message || "Registration Successful!");
            window.location.href = "login.html";
        } else {
            // Error: Handled by backend (e.g., ID not found or already registered)
            alert(data.message || "Registration Failed. Please check your Employee ID."); 
        }
    } catch (err) {
        // Network or Server failure handling
        console.error("Connection Error:", err);
        alert("Registration failed. Unable to reach the server. Please ensure the backend is running!");
    }
}