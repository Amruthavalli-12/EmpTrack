// timetable.js

const API_URL = "http://localhost:5000/api/admin";

async function fetchMyTimetable() {
    // 1. LocalStorage nundi employee details theeskuntunnam
    const sessionData = localStorage.getItem("loggedInEmployee");
    if (!sessionData) return;
    
    const emp = JSON.parse(sessionData);
    const myDept = emp.dept || "General";

    // UI lo Dept Name update chesthunnam
    document.getElementById("dept_badge").innerText = myDept;

    try {
        // 2. Database nundi filter chesi data theeskuntunnam
        // Example: /get-timetable?dept=AIML
        const res = await fetch(`${API_URL}/get-timetable?dept=${myDept}`);
        const schedule = await res.json();
        
        const tableBody = document.getElementById("tt_body");
        tableBody.innerHTML = "";

        if (schedule.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="empty-state">
                        <i class="fas fa-calendar-times" style="font-size: 30px; margin-bottom: 10px; display: block;"></i>
                        No schedule found for ${myDept} group.
                    </td>
                </tr>`;
            return;
        }

        // 3. Data ni Table loki inject chesthunnam
        schedule.forEach(item => {
            const row = `
                <tr>
                    <td class="day-name">${item.day}</td>
                    <td><span class="time-box">${item.startTime} - ${item.endTime}</span></td>
                    <td class="task-name">${item.task}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

    } catch (err) {
        console.error("Error fetching timetable:", err);
        document.getElementById("tt_body").innerHTML = "<tr><td colspan='3' class='empty-state'>Failed to load data.</td></tr>";
    }
}