const API_URL = "http://localhost:5000/api/admin";

// 1. Main Function to Save or Update Employee
async function saveEmployee() {
    const idValue = document.getElementById("id").value;
    const name = document.getElementById("name").value;
    const dept = document.getElementById("dept").value;
    const designation = document.getElementById("designation").value;
    const education = document.getElementById("education").value;
    const salary = document.getElementById("salary").value;

    if (!idValue || !name || !dept || !designation || !education || !salary) {
        alert("Please fill in all employee details!");
        return;
    }

    // IMPORTANT:
    // The backend SQL query/Model might use 'empId', 
    // so the payload key is set to 'empId'.
    const payload = { 
        empId: idValue, 
        name, 
        dept, 
        designation, 
        education, 
        salary 
    };

    const isUpdate = document.getElementById("updateBtn").style.display === "inline-block";
    
    // Use 'PUT' for updates and 'POST' for adding new records
    const endpoint = isUpdate ? `${API_URL}/update-employee/${idValue}` : `${API_URL}/add-employee`;
    const method = isUpdate ? 'PUT' : 'POST';

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || "Operation Successful ✅");
            resetForm(); 
            displayEmployees(); 
        } else {
            // Display clear database error message
            alert("Database Error: " + result.message);
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        alert("Server is not connected!");
    }
}

// 2. Table Refresh Function
async function displayEmployees() {
    try {
        const response = await fetch(`${API_URL}/all-employees`);
        const employees = await response.json();

        const tbody = document.getElementById("tableBody");
        tbody.innerHTML = "";

        if (!employees || employees.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No employees found.</td></tr>";
            return;
        }

        employees.forEach(emp => {
            // Check the ID field name coming from the database (empId or id)
            const currentId = emp.empId || emp.id; 
            
            tbody.innerHTML += `
                <tr>
                    <td><span style="font-weight:800; color:#4318ff;">${currentId}</span></td>
                    <td>${emp.name}</td>
                    <td>${emp.dept}</td>
                    <td><span style="background:#f4f7fe; padding:4px 8px; border-radius:6px;">${emp.designation || 'N/A'}</span></td>
                    <td>${emp.education || 'N/A'}</td>
                    <td style="text-align: center;">
                        <i class="fas fa-edit" onclick="editEmp('${currentId}', '${emp.name}', '${emp.dept}', '${emp.designation}', '${emp.education}', '${emp.salary}')" style="color: #00d2ff; cursor: pointer; margin-right: 15px;"></i>
                        <i class="fas fa-trash" onclick="deleteEmp('${currentId}')" style="color: #ff5b5b; cursor: pointer;"></i>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.log("Load error:", err);
    }
}

// 3. Delete Function
async function deleteEmp(empId) {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
        const response = await fetch(`${API_URL}/delete-employee/${empId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        alert(result.message);
        displayEmployees();
    } catch (err) {
        alert("Delete operation failed!");
    }
}

// 4. Edit Mode Logic
function editEmp(id, name, dept, designation, education, salary) {
    document.getElementById("id").value = id;
    document.getElementById("name").value = name;
    document.getElementById("dept").value = dept;
    document.getElementById("designation").value = (designation && designation !== 'undefined') ? designation : "";
    document.getElementById("education").value = (education && education !== 'undefined') ? education : "";
    document.getElementById("salary").value = (salary && salary !== 'undefined') ? salary : "";

    document.getElementById("saveBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "inline-block";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. Form Reset Logic
function resetForm() {
    document.getElementById("id").value = "";
    document.getElementById("name").value = "";
    document.getElementById("dept").value = "";
    document.getElementById("designation").value = "";
    document.getElementById("education").value = "";
    document.getElementById("salary").value = "";
    
    document.getElementById("saveBtn").style.display = "inline-block";
    document.getElementById("updateBtn").style.display = "none";
}

async function finalizeUpdate() {
    await saveEmployee();
}