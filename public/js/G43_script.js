// Purpose: Handles frontend events, form submissions, and API calls (fetch) for this module.
// Purpose: Handles frontend events, form submissions, and API calls (fetch) for the Room module.

document.addEventListener('DOMContentLoaded', () => {
    // Automatically load rooms as soon as the page is ready
    loadRooms();
});

// Fetch and display rooms
async function loadRooms() {
    try {
        const response = await fetch('/api/g43');
        const rooms = await response.json();
        
        const roomListDiv = document.getElementById('roomList');
        if (!rooms || rooms.length === 0) {
            roomListDiv.innerHTML = '<p style="color: #64748b;">No rooms added yet.</p>';
            return;
        }

        // Build the table dynamically
        let html = '<table style="width:100%; text-align:left; border-collapse: collapse;">';
        html += '<tr style="border-bottom: 2px solid #e2e8f0; color: #334155;"><th>Room Number</th><th>Type</th><th>Base Rent</th></tr>';
        
        rooms.forEach(r => {
            html += `<tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 12px 0; color: var(--primary);"><strong>${r.roomNumber}</strong></td>
                        <td style="color: #475569;">${r.roomType}</td>
                        <td style="color: #475569;">₹${r.baseRent.toLocaleString('en-IN')}</td>
                     </tr>`;
        });
        
        html += '</table>';
        roomListDiv.innerHTML = html;
    } catch (err) {
        console.error("Error loading rooms:", err);
        document.getElementById('roomList').innerHTML = '<p style="color: #ef4444;">Failed to load rooms from the server.</p>';
    }
}

// Save a new room
async function saveRoom() {
    const data = {
        roomNumber: document.getElementById('roomNumber').value.trim().toUpperCase(),
        roomType: document.getElementById('roomType').value,
        baseRent: document.getElementById('baseRent').value
    };

    if (!data.roomNumber || !data.baseRent) {
        return alert("Please fill all fields before saving.");
    }

    try {
        const response = await fetch('/api/g43', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert("Room Saved Successfully!");
            // Clear the form inputs
            document.getElementById('roomNumber').value = '';
            document.getElementById('baseRent').value = '';
            // Refresh the table to show the new room
            loadRooms(); 
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        console.error("Save Error:", err);
        alert("Server error while attempting to save the room.");
    }
}