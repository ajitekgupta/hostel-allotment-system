// Purpose: Handles frontend events, form submissions, and API calls (fetch) for this module.
// Purpose: Handles frontend events, form submissions, and API calls (fetch) for the Complaint module.

document.addEventListener('DOMContentLoaded', () => {
    // Automatically load complaints when the page loads
    loadComplaints();
});

// Fetch and display complaints
async function loadComplaints() {
    try {
        const response = await fetch('/api/g46');
        const complaints = await response.json();
        
        const listDiv = document.getElementById('complaintList');
        if (!complaints || complaints.length === 0) {
            listDiv.innerHTML = '<p style="color: #64748b;">No maintenance requests logged yet.</p>';
            return;
        }

        let html = '';
        complaints.forEach(c => {
            // Dynamic color coding for the status badge
            let badgeColor = '#ef4444'; // Red for Pending
            let badgeBg = '#fef2f2';
            if (c.complaintStatus === 'In Progress') {
                badgeColor = '#f59e0b'; // Yellow
                badgeBg = '#fffbeb';
            } else if (c.complaintStatus === 'Resolved') {
                badgeColor = '#10b981'; // Green
                badgeBg = '#ecfdf5';
            }

            html += `
            <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 15px; background-color: #f8fafc; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                    <strong style="color: #334155; font-size: 1.05em;">${c.issueType}</strong>
                    <span style="color: ${badgeColor}; background-color: ${badgeBg}; border: 1px solid ${badgeColor}40; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 0.8em; text-transform: uppercase;">
                        ${c.complaintStatus}
                    </span>
                </div>
                <p style="margin: 0 0 12px 0; font-size: 0.95em; color: #475569; line-height: 1.5;">${c.description}</p>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 8px;">
                    <small style="color: #94a3b8; font-weight: 600;">Student ID: <span style="color: var(--primary);">${c.studentId}</span></small>
                </div>
            </div>`;
        });
        
        listDiv.innerHTML = html;
    } catch (err) {
        console.error("Error loading complaints:", err);
        document.getElementById('complaintList').innerHTML = '<p style="color: #ef4444;">Failed to load complaints from the server.</p>';
    }
}

// Submit a new complaint
async function submitComplaint() {
    const data = {
        studentId: document.getElementById('studentId').value.trim().toUpperCase(),
        issueType: document.getElementById('issueType').value,
        description: document.getElementById('description').value.trim()
    };

    if (!data.studentId || !data.description) {
        return alert("Please provide both your Student ID and a description of the issue.");
    }

    try {
        const response = await fetch('/api/g46', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert("Complaint Logged Successfully!");
            // Clear the description, but keep the student ID filled out for convenience
            document.getElementById('description').value = '';
            // Refresh the list automatically
            loadComplaints(); 
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        console.error("Submission Error:", err);
        alert("Server error while submitting the complaint.");
    }
}