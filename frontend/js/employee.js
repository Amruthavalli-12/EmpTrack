/**
 * Data Access: Retrieves the list of employees from LocalStorage.
 * Returns an empty array if no data exists.
 */
function getEmployees() {
    return JSON.parse(localStorage.getItem("employees")) || [];
}

/**
 * Data Persistence: Saves the updated employee array back to LocalStorage.
 * @param {Array} data - The array of employee objects.
 */
function saveEmployees(data) {
    localStorage.setItem("employees", JSON.stringify(data));
}

/**
 * Operation: Adds a new employee to the system.
 * Validates input fields before updating the storage and refreshing the UI.
 */
function addEmployee() {
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let department = document.getElementById("department").value.trim();

    if (name === "" || email === "" || department === "") {
        alert("Action Required: Please fill in all mandatory fields.");
        return;
    }

    let employees = getEmployees();

    employees.push({
        name: name,
        email: email,
        department: department
    });

    saveEmployees(employees);

    alert("Success: Employee record added successfully.");

    // Refresh the table display
    loadEmployees();

    // Reset form inputs for the next entry
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("department").value = "";
}

/**
 * Operation: Loads and renders the employee table.
 * Iterates through the stored data to generate HTML table rows.
 */
function loadEmployees() {
    let employees = getEmployees();
    let rows = "";

    employees.forEach((emp, index) => {
        rows += `
        <tr>
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${emp.department}</td>
            <td>
                <button onclick="editEmployee(${index})" style="cursor:pointer;">Edit</button>
                <button onclick="deleteEmployee(${index})" style="cursor:pointer; color:red;">Delete</button>
            </td>
        </tr>
        `;
    });

    const tableBody = document.getElementById("employeeTable");
    if (tableBody) {
        tableBody.innerHTML = rows;
    }
}

/**
 * Operation: Deletes an employee record.
 * @param {number} index - The position of the employee in the array.
 */
function deleteEmployee(index) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    let employees = getEmployees();
    employees.splice(index, 1);

    saveEmployees(employees);
    loadEmployees();
}

/**
 * Operation: Edits an existing employee record.
 * Populates the form with existing data and removes the old entry 
 * to allow for an updated submission.
 */
function editEmployee(index) {
    let employees = getEmployees();
    let emp = employees[index];

    // Populate form fields with selected employee data
    document.getElementById("name").value = emp.name;
    document.getElementById("email").value = emp.email;
    document.getElementById("department").value = emp.department;

    // Remove the current record to prevent duplicates upon saving edits
    employees.splice(index, 1);
    saveEmployees(employees);
    loadEmployees();
}

/**
 * Search/Filter: Filters the employee list based on the name.
 * @param {string} value - The search query entered by the user.
 */
function searchEmployee(value) {
    let employees = getEmployees();
    let rows = "";

    employees.filter(emp => emp.name.toLowerCase().includes(value.toLowerCase()))
    .forEach((emp, index) => {
        rows += `
        <tr>
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${emp.department}</td>
            <td>
                <button onclick="editEmployee(${index})">Edit</button>
                <button onclick="deleteEmployee(${index})">Delete</button>
            </td>
        </tr>
        `;
    });

    document.getElementById("employeeTable").innerHTML = rows;
}