const API_URL = "http://localhost:5000/api/admin";

// 1. Load Payroll & Check Payment Status
async function loadPayroll() {
    const month = document.getElementById("payrollMonth").value;
    const tbody = document.getElementById("payrollTableBody");
    const payBtn = document.getElementById("payBtn");

    tbody.innerHTML = "<tr><td colspan='8'>Fetching data... ⏳</td></tr>";
    
    try {
        // Fetching both attendance and payroll history simultaneously
        const [attRes, payRes] = await Promise.all([
            fetch(`${API_URL}/get-attendance`),
            fetch(`${API_URL}/payroll-history`)
        ]);

        const attendanceRecords = await attRes.json();
        const payrollHistory = await payRes.json();

        // Filtering attendance records for the selected month
        const currentMonthRecords = attendanceRecords.filter(rec => rec.month === month);
        
        tbody.innerHTML = "";

        if (currentMonthRecords.length === 0) {
            tbody.innerHTML = "<tr><td colspan='8'>No attendance data found for this month.</td></tr>";
            payBtn.disabled = true;
            return;
        }

        currentMonthRecords.forEach(rec => {
            // Check if this specific employee has already been paid for the selected month
            const paidRec = payrollHistory.find(p => p.month === month && p.empId === rec.empId);
            const isEmployeePaid = !!paidRec;

            const baseSalary = parseFloat(rec.salary) || 10000; 
            const absentCount = parseInt(rec.absent) || 0;
            const deductionPerDay = 1000; 
            const totalDeduction = absentCount * deductionPerDay;
            const netSalary = baseSalary - totalDeduction;

            let statusHTML = `<span style="color:#ffa500; font-weight:800;">Pending ⏳</span>`;
            let actionHTML = "-";

            if (isEmployeePaid) {
                statusHTML = `<span class="status-paid" style="background:#e6faf5; color:#05cd99; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:800;">Paid ✅</span>`;
                actionHTML = `
                    <button class="btn-delete" onclick="deleteSinglePayroll('${paidRec._id}')" 
                            style="background:none; border:none; color:#ee5d50; cursor:pointer; font-size:18px;">
                        <i class="fas fa-trash-alt"></i>
                    </button>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>${rec.empId}</td>
                    <td class="emp-name">${rec.name || 'Unknown'}</td>
                    <td>${rec.dept || 'N/A'}</td>
                    <td>${absentCount}</td>
                    <td style="color:#ee5d50;">-₹${totalDeduction}</td>
                    <td style="color:#4318ff; font-weight:800;">₹${netSalary}</td>
                    <td>${statusHTML}</td>
                    <td>${actionHTML}</td>
                </tr>`;
        });

        // Button Logic: Disable the 'Pay All' button only if everyone in the list is already paid
        const allPaid = currentMonthRecords.every(rec => 
            payrollHistory.some(p => p.month === month && p.empId === rec.empId)
        );

        if (allPaid) {
            payBtn.disabled = true;
            payBtn.style.background = "#cbd5e0";
            payBtn.innerHTML = `<i class="fas fa-check-circle"></i> All Paid`;
        } else {
            payBtn.disabled = false;
            payBtn.style.background = "#05cd99";
            payBtn.innerHTML = `<i class="fas fa-hand-holding-usd"></i> Finalize & Pay All`;
        }

    } catch (err) {
        console.error("Load error:", err);
        tbody.innerHTML = "<tr><td colspan='8'>Server error! ❌</td></tr>";
    }
}

// 2. Finalize Payroll and Save to Database
async function finalizePayroll() {
    const month = document.getElementById("payrollMonth").value;
    const tbody = document.getElementById("payrollTableBody");
    const rows = tbody.querySelectorAll("tr");

    if (rows.length === 0 || rows[0].innerText.includes("No attendance")) {
        alert("Please load the employee details first!");
        return;
    }

    if (!confirm(`Are you sure you want to finalize the payroll for ${month}? This action is typically performed once.`)) return;

    let payrollData = [];
    rows.forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length >= 7) {
            payrollData.push({
                empId: cols[0].innerText,
                name: cols[1].innerText,
                month: month,
                absent: parseInt(cols[3].innerText) || 0,
                deduction: parseFloat(cols[4].innerText.replace(/[^\d.]/g, '')) || 0,
                netSalary: parseFloat(cols[5].innerText.replace(/[^\d.]/g, '')) || 0,
                status: "Paid",
                date: new Date().toISOString()
            });
        }
    });

    try {
        const response = await fetch(`${API_URL}/finalize-payroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month, records: payrollData })
        });

        if (response.ok) {
            alert(`Success! ${month} salaries have been credited to all employees. ✅`);
            loadPayroll(); 
        } else {
            const result = await response.json();
            alert("Error: " + result.message);
        }
    } catch (err) {
        alert("Server error occurred during the payment process!");
    }
}

// 3. Delete a Single Payroll Record
async function deleteSinglePayroll(recordId) {
    if (!confirm("Are you sure you want to delete this specific salary record?")) return;

    try {
        const response = await fetch(`${API_URL}/delete-payroll-record/${recordId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            loadPayroll(); 
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        alert("Server connection failed!");
    }
}