// add_timetable.js

const API_URL = "http://localhost:5000/api/admin";

// 1. SAVE DATA FUNCTION
async function saveSchedule() {
    const data = {
        dept: document.getElementById("dept").value,
        day: document.getElementById("day").value,
        task: document.getElementById("task").value,
        startTime: document.getElementById("startTime").value,
        endTime: document.getElementById("endTime").value
    };

    // Validation: Ensure all required fields are filled
    if(!data.task || !data.startTime) return alert("Please fill in all required fields! ❌");

    try {
        const res = await fetch(`${API_URL}/add-timetable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if(res.ok) {
            alert("Schedule Added Successfully! ✅");
            
            // Clear the form fields after successful submission
            document.getElementById("task").value = "";
            document.getElementById("startTime").value = "";
            document.getElementById("endTime").value = "";
            
            // Refresh the table immediately to show the new entry
            loadAllSchedules(); 
        }
    } catch (err) { 
        console.error("Save Error:", err); 
    }
}

// 2. LOAD ALL DATA (TABLE) FUNCTION
async function loadAllSchedules() {
    try {
        // Fetch all schedules from the backend API
        const res = await fetch(`${API_URL}/get-all-timetables`); 
        const data = await res.json();
        
        const list = document.getElementById("schedule_list");
        if (!list) return;

        // Clear the existing list before loading updated data
        list.innerHTML = ""; 

        if (data.length === 0) {
            list.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No schedules added yet! 📭</td></tr>";
            return;
        }

        data.forEach(item => {
            list.innerHTML += `
                <tr>
                    <td><span class="dept-tag">${item.dept}</span></td>
                    <td><b>${item.day}</b></td>
                    <td>${item.startTime} - ${item.endTime}</td>
                    <td>${item.task}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteSchedule('${item._id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Load Error:", err);
    }
}

// 3. DELETE DATA FUNCTION
async function deleteSchedule(id) {
    // Confirmation dialog before deletion
    if (!confirm("Are you sure you want to delete this task? 🗑️")) return;

    try {
        const res = await fetch(`${API_URL}/delete-timetable/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            alert("Deleted Successfully! ✅");
            // Refresh the table immediately after deletion
            loadAllSchedules(); 
        } else {
            alert("Delete operation failed! ❌");
        }
    } catch (err) {
        console.error("Delete Error:", err);
    }
}