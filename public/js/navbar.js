// Purpose: Automatically injects the shared navbar, handles active states, and manages basic Role-Based Access Control (RBAC).

document.addEventListener("DOMContentLoaded", function() {
    // 1. Get the current page name
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    
    // 2. Check the user's role and ID from localStorage
    const userRole = localStorage.getItem('userRole');
    const studentId = localStorage.getItem('studentId'); // Updated to match login.html

    // ==========================================
    // 🛡️ SECURITY GATE (Module Specific)
    // ==========================================
    // We ONLY lock down the G45 (Fees) module. 
    // This allows other groups to develop their pages without being forced to login.
    if (currentPage === 'G45_payments.html' && !userRole) {
        window.location.href = 'login.html';
        return;
    }

    // Do not inject the navbar on standalone pages (Login or Mobile Verification)
    if (currentPage === 'login.html' || currentPage.includes('verify')) return;

    // ==========================================
    // 🔗 ROLE-BASED LINK GENERATION
    // ==========================================
    const isStudent = (userRole === 'student');

    // Admin Links (Visible to Admins and Guests)
    const adminLinks = `
        <a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Dashboard</a>
        <a href="G42_students.html" class="${currentPage === 'G42_students.html' ? 'active' : ''}">Students</a>
        <a href="G43_rooms.html" class="${currentPage === 'G43_rooms.html' ? 'active' : ''}">Rooms</a>
        <a href="G44_allotment.html" class="${currentPage === 'G44_allotment.html' ? 'active' : ''}">Allotment</a>
    `;

    // Maintenance Link (Visible to Admins and Guests)
    const maintenanceLink = `
        <a href="G46_complaints.html" class="${currentPage === 'G46_complaints.html' ? 'active' : ''}">Maintenance</a>
    `;

    // ==========================================
    // 👤 DYNAMIC AUTH SECTION
    // ==========================================
    let authSection = '';
    if (userRole) {
        // Show who is logged in + Logout button
        const displayName = userRole === 'admin' ? 'Warden (Admin)' : `Student: ${studentId}`;
        authSection = `
            <div class="nav-auth" style="margin-left: auto; display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 0.9rem; font-weight: 600; color: #64748b;">${displayName}</span>
                <button class="btn btn-primary" onclick="logoutUser()" style="padding: 6px 15px; background: #ef4444; border: none;">Logout</button>
            </div>
        `;
    } else {
        // Show Sign In button if a guest
        authSection = `
            <div class="nav-auth" style="margin-left: auto;">
                <button class="btn btn-primary" onclick="window.location.href='login.html'" style="padding: 6px 15px;">Sign In</button>
            </div>
        `;
    }

    // ==========================================
    // 🏗️ BUILD AND INJECT NAVBAR
    // ==========================================
    // I added some inline flex styles to ensure the authSection stays on the right side
    const navbarHTML = `
    <nav class="navbar" style="display: flex; align-items: center;">
        <div class="nav-content" style="display: flex; width: 100%; align-items: center;">
            <div class="logo" style="margin-right: 30px;">LNMIIT Hostel</div>
            <div class="links" style="display: flex; gap: 15px;">
                
                ${isStudent ? '' : adminLinks}
                
                <a href="${userRole ? 'G45_payments.html' : 'login.html'}" class="${currentPage === 'G45_payments.html' ? 'active' : ''}">Fees</a>
                
                ${isStudent ? '' : maintenanceLink}
                
            </div>
            
            ${authSection}
        </div>
    </nav>
    `;

    // Inject into the body
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
});

// ==========================================
// 🚪 LOGOUT FUNCTION
// ==========================================
function logoutUser() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('studentId'); // Updated to match your new login logic
    
    // Send them back to the public dashboard
    window.location.href = 'index.html'; 
}

// ==========================================
// 🔐 DASHBOARD GATEKEEPER
// ==========================================
// Called when someone clicks the "Fees & Payments" card on the main dashboard
function checkFeeAccess() {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole) {
        // If already logged in, send them straight to the module
        window.location.href = 'G45_payments.html';
    } else {
        // If not logged in, force them through the login gate
        window.location.href = 'login.html';
    }
}