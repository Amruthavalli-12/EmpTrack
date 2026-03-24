async function saveEmployee() {
    console.log("Save button clicked! ✅"); // Test 1

    const id = document.getElementById("id").value;
    const name = document.getElementById("name").value;
    const dept = document.getElementById("dept").value;
    const salary = document.getElementById("salary").value;

    const payload = { id, name, dept, salary };
    console.log("Sending data to backend:", payload); // Test 2

    try {
        // Verification: Ensure the correct port (5000) is being used for the backend
        const response = await fetch('http://localhost:5000/api/admin/add-employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log("Server response:", result); // Test 3

        if (response.ok) {
            alert("Records saved successfully ✅");
            loadEmployees(); // Refresh the table to show updated data
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        console.error("CRITICAL ERROR:", err);
        alert("Server not connected");
    }
}

// 2. Function to load data into the table (Fetching from MongoDB Atlas)
async function loadEmployees() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/all-employees');
        const data = await response.json();

        let tableBody = document.getElementById("tableBody"); // Verify that the <tbody> ID matches
        tableBody.innerHTML = ""; // Clear existing rows before loading new data

        data.forEach(emp => {
            tableBody.innerHTML += `
                <tr>
                    <td>${emp.empId}</td>
                    <td>${emp.name}</td>
                    <td>${emp.dept}</td>
                    <td>${emp.salary}</td>
                    <td>
                        <button onclick="deleteEmp('${emp.empId}')" style="background:red; color:white; border:none; padding:5px; border-radius:5px; cursor:pointer;">Delete</button>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.log("Error loading table:", err);
    }
}

// 3. Function to handle employee deletion (Sending DELETE request to backend)
async function deleteEmp(empId) {
    if(!confirm("Are you sure you want to delete this record?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/admin/delete-employee/${empId}`, {
            method: 'DELETE'
        });
        const res = await response.json();
        alert(res.message);
        loadEmployees(); // Refresh table after deletion
    } catch (err) {
        alert("Delete failed!");
    }
}

// Load the employee table automatically when the page opens
window.onload = loadEmployees;