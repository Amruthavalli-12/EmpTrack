const API_URL = "http://localhost:5000/api/admin";

async function loadSalaryHistory() {
    // 1. Session Data Check
    const sessionEmp = JSON.parse(localStorage.getItem("employee")) || 
                      JSON.parse(localStorage.getItem("loggedInEmployee"));

    if (!sessionEmp) {
        window.location.href = "../../login/login.html";
        return;
    }

    try {
        // 2. Data Fetch (Parallel)
        const [payrollRes, empRes] = await Promise.all([
            fetch(`${API_URL}/payroll-history`),
            fetch(`${API_URL}/all-employees`)
        ]);

        const allPayroll = await payrollRes.json();
        const allEmps = await empRes.json();

        // 3. Current User Details (Dept & Full Name kosam)
        const fullEmpData = allEmps.find(e => e.empId === sessionEmp.empId);
        const currentDept = fullEmpData ? (fullEmpData.dept || "Not Assigned") : "General";

        // 4. Filter only My Payroll
        const myPayroll = allPayroll.filter(p => p.empId === sessionEmp.empId);
        const tbody = document.getElementById("salaryTableBody");
        tbody.innerHTML = "";

        let totalNet = 0;
        let lastBase = 0;

        if (myPayroll.length === 0) {
            tbody.innerHTML = "<tr><td colspan='8' style='text-align:center; padding:50px; color:#a3aed0;'>No salary records found in database.</td></tr>";
            return;
        }

        // 5. Display Records (Newest First)
        myPayroll.reverse().forEach(record => {
            const netVal = Number(record.netSalary || record.amount || 0);
            const baseVal = Number(record.baseSalary || record.salary || 0);
            const deductVal = Number(record.deduction || 0);
            const monthName = record.month || "Unknown";

            totalNet += netVal;
            lastBase = baseVal;

            tbody.innerHTML += `
                <tr>
                    <td><span style="font-weight:800; color:#1b2559;">${monthName}</span></td>
                    <td>₹${baseVal.toLocaleString('en-IN')}</td>
                    <td><span style="color:#ee5d50;">${record.absent || 0}</span></td>
                    <td style="color:#ee5d50; font-weight:700;">-₹${deductVal.toLocaleString('en-IN')}</td>
                    <td><span style="color:#05cd99; font-weight:800;">₹${netVal.toLocaleString('en-IN')}</span></td>
                    <td><span class="status-paid">PAID</span></td>
                    <td style="color:#a3aed0;">${new Date(record.date || Date.now()).toLocaleDateString('en-IN')}</td>
                    <td>
                        <button class="download-btn" 
                            data-month="${monthName}" 
                            data-amount="${netVal}" 
                            data-base="${baseVal}"
                            data-deduct="${deductVal}"
                            data-dept="${currentDept}"
                            data-empid="${sessionEmp.empId}"
                            onclick="prepareAndPrint(this)">
                            <i class="fas fa-download"></i> Pay Slip
                        </button>
                    </td>
                </tr>`;
        });

        // 6. Summary Update
        document.getElementById("totalNetDisplay").innerText = `₹${totalNet.toLocaleString('en-IN')}`;
        document.getElementById("baseDisplay").innerText = `₹${lastBase.toLocaleString('en-IN')}`;

    } catch (err) {
        console.error("Error loading salary:", err);
    }
}

/**
 * PAY SLIP PREPARATION
 */
function prepareAndPrint(btn) {
    const sessionEmp = JSON.parse(localStorage.getItem("employee")) || 
                      JSON.parse(localStorage.getItem("loggedInEmployee"));

    // 1. Collect data from button attributes
    const month = btn.getAttribute("data-month");
    const amount = Number(btn.getAttribute("data-amount"));
    const base = Number(btn.getAttribute("data-base"));
    const deduct = Number(btn.getAttribute("data-deduct"));
    const dept = btn.getAttribute("data-dept");
    const empId = btn.getAttribute("data-empid");

    // 2. Inject into Hidden Print Section
    document.getElementById("slipName").innerText = sessionEmp.name;
    document.getElementById("slipId").innerText = empId;
    document.getElementById("slipDept").innerText = dept;
    document.getElementById("slipMonth").innerText = month;
    document.getElementById("slipDate").innerText = "Date: " + new Date().toLocaleDateString('en-IN');
    
    // Detailed Amounts
    document.getElementById("slipBase").innerText = "₹" + base.toLocaleString('en-IN');
    document.getElementById("slipDeduct").innerText = "-₹" + deduct.toLocaleString('en-IN');
    document.getElementById("slipAmount").innerText = "₹" + amount.toLocaleString('en-IN');

    // 3. Trigger Print
    window.print();
}

// Start Loading
document.addEventListener("DOMContentLoaded", loadSalaryHistory);