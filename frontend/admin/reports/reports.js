let myChart = null;
const API_URL = "http://localhost:5000/api/admin";

// 1. Theme and Header Configuration
const reportThemes = {
    attendance: { color: "#1cc88a", title: "Attendance Report", class: "report-header-attendance" },
    payroll: { color: "#4e73df", title: "Payroll Report", class: "report-header-payroll" },
    leave: { color: "#6f42c1", title: "Leave Report", class: "report-header-leave" },
    details: { color: "#36b9cc", title: "Employee Details", class: "report-header-details" }
};

window.onload = async () => {
    console.log("Reports Module Initialized");
    await updateSubFilters();
    applyReportTheme(); // Trigger initial theme application
};

// 2. Header Color and Title Update Logic
function applyReportTheme() {
    const type = document.getElementById("reportType").value;
    const theme = reportThemes[type];
    
    const header = document.getElementById("dynamicHeader");
    const titleSpan = document.getElementById("reportTitle");

    if (header && theme) {
        // Remove previous theme classes and apply the new one
        header.className = theme.class; 
        titleSpan.innerText = theme.title;
        console.log(`Theme updated to: ${type}`);
    }
    
    generateFilteredReport(); // Refresh data whenever the theme changes
}

// 3. Filter Logic (Database Integration)
async function updateSubFilters() {
    const category = document.getElementById("filterCategory").value;
    const subFilter = document.getElementById("subFilter");
    
    try {
        const response = await fetch(`${API_URL}/all-employees`);
        const employees = await response.json();

        subFilter.innerHTML = "";
        if (category === "all") {
            subFilter.style.display = "none";
        } else {
            subFilter.style.display = "inline-block";
            // Map either names or unique departments based on the category
            let options = (category === "name") 
                ? employees.map(e => e.name) 
                : [...new Set(employees.map(e => e.dept || "General"))];
            
            options.forEach(opt => {
                let el = document.createElement("option");
                el.value = opt; 
                el.innerText = opt;
                subFilter.appendChild(el);
            });
        }
        generateFilteredReport();
    } catch (err) {
        console.error("Error loading sub-filters:", err);
    }
}

// 4. Report Generation Logic
async function generateFilteredReport() {
    const type = document.getElementById("reportType").value;
    const category = document.getElementById("filterCategory").value;
    const subVal = document.getElementById("subFilter").value;
    
    try {
        // Fetching all necessary data in parallel for better performance
        const [empRes, attRes, payRes] = await Promise.all([
            fetch(`${API_URL}/all-employees`),
            fetch(`${API_URL}/get-attendance`),
            fetch(`${API_URL}/payroll-history`)
        ]);

        const employees = await empRes.json();
        const attendance = await attRes.json();
        const payrollHistory = await payRes.json();
        
        // Formatting current month/year for data matching
        const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

        let filteredData = employees;
        if (category === "name" && subVal) filteredData = employees.filter(e => e.name === subVal);
        if (category === "dept" && subVal) filteredData = employees.filter(e => (e.dept || "General") === subVal);

        displayTable(type, filteredData, attendance, payrollHistory, month);
        updateChart(type, filteredData, attendance, payrollHistory, month);
    } catch (err) {
        console.error("Report Generation Error:", err);
    }
}

// 5. Dynamic Table Rendering
function displayTable(type, data, attendance, payroll, month) {
    const head = document.getElementById("reportHead");
    const body = document.getElementById("reportTableBody");
    body.innerHTML = "";

    if (type === "attendance") {
        head.innerHTML = "<tr><th>ID</th><th>Name</th><th>Month</th><th>Present</th><th>Absent</th></tr>";
        data.forEach(e => {
            let s = attendance.find(a => a.empId === e.empId && a.month === month) || {present:0, absent:0};
            body.innerHTML += `<tr><td>${e.empId}</td><td>${e.name}</td><td>${month}</td><td>${s.present}</td><td>${s.absent}</td></tr>`;
        });
    } else if (type === "payroll") {
        head.innerHTML = "<tr><th>ID</th><th>Name</th><th>Month</th><th>Net Pay</th><th>Status</th></tr>";
        data.forEach(e => {
            let p = payroll.find(pr => pr.empId === e.empId && pr.month === month) || {netSalary:0, status:'Pending'};
            body.innerHTML += `<tr><td>${e.empId}</td><td>${e.name}</td><td>${month}</td><td>₹${p.netSalary}</td><td>${p.status}</td></tr>`;
        });
    } else {
        head.innerHTML = "<tr><th>ID</th><th>Name</th><th>Dept</th><th>Role</th></tr>";
        data.forEach(e => {
            body.innerHTML += `<tr><td>${e.empId}</td><td>${e.name}</td><td>${e.dept||'Gen'}</td><td>${e.role}</td></tr>`;
        });
    }
}

// 6. Chart.js Data Visualization
function updateChart(type, data, attendance, payroll, month) {
    const canvas = document.getElementById('reportChart');
    if (myChart) myChart.destroy(); // Destroy previous chart instance before creating a new one
    
    const ctx = canvas.getContext('2d');
    const themeColor = reportThemes[type].color;
    
    let labels = data.map(e => e.name);
    let chartValues = [];
    let labelText = "";

    if (type === "attendance") {
        labelText = "Present Days";
        chartValues = data.map(e => {
            let a = attendance.find(at => at.empId === e.empId && at.month === month);
            return a ? a.present : 0;
        });
    } else if (type === "payroll") {
        labelText = "Salary Disbursed (₹)";
        chartValues = data.map(e => {
            let p = payroll.find(pr => pr.empId === e.empId && pr.month === month);
            return p ? p.netSalary : 0;
        });
    } else {
        // Default visualization: total count per category
        chartValues = data.map(() => data.length);
        labelText = "Employee Count";
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ 
                label: labelText, 
                data: chartValues, 
                backgroundColor: themeColor, 
                borderRadius: 5 
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } } 
        }
    });
}