document.addEventListener('DOMContentLoaded', () => {

    const allotForm    = document.getElementById('allotmentForm');
    const transferForm = document.getElementById('transferForm');
    const allotMsg     = document.getElementById('allot-message');
    const transferMsg  = document.getElementById('transfer-message');
    const tableBody    = document.getElementById('allotmentsTableBody');
    const searchBar    = document.getElementById('searchBar');
    const navItems     = document.querySelectorAll('.G44-nav-item');
    const breadcrumb   = document.getElementById('breadcrumb-current');

    const AC_BLOCKS    = ['BH4', 'BH5'];
    const GIRLS_BLOCK  = 'GH1';

    document.getElementById('hamburgerBtn').addEventListener('click', () => {
        document.getElementById('G44Sidebar').classList.toggle('collapsed');
    });

    function showMessage(el, text, isSuccess) {
        el.style.color = isSuccess ? 'green' : 'red';
        el.innerText = text;
    }

    // Sidebar navigation
    const sectionTitles = {
        assign:     'Assign a Room',
        transfer:   'Transfer / Change Room',
        allotments: 'Current Allotments'
    };

    function showSection(sectionId) {
        document.querySelectorAll('.G44-section').forEach(s => s.style.display = 'none');
        document.getElementById('section-' + sectionId).style.display = 'block';
        breadcrumb.innerText = sectionTitles[sectionId];
        navItems.forEach(item => item.classList.toggle('active', item.dataset.section === sectionId));
        if (sectionId === 'allotments') fetchAllotments();
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(item.dataset.section);
        });
    });

    // Auto-set AC and lock it when BH4/BH5 is selected
    function handleBlockChange(blockSelectId, acRadioGroupId, acRadioName) {
        const blockSelect   = document.getElementById(blockSelectId);
        const acRadioGroup  = document.getElementById(acRadioGroupId);

        blockSelect.addEventListener('change', () => {
            const block = blockSelect.value;
            const acRadios = document.querySelectorAll(`input[name="${acRadioName}"]`);

            if (AC_BLOCKS.includes(block)) {
                acRadios.forEach(r => {
                    r.checked  = (r.value === 'AC');
                    r.disabled = true;
                });
                acRadioGroup.style.opacity = '0.6';
                acRadioGroup.title = 'BH4 and BH5 are AC only';
            } else {
                acRadios.forEach(r => { r.disabled = false; });
                acRadioGroup.style.opacity = '1';
                acRadioGroup.title = '';
            }
        });
    }

    handleBlockChange('block', 'acRadioGroup', 'acType');
    handleBlockChange('transferBlock', 'transferAcRadioGroup', 'transferAcType');

    // GH1 gender validation
    function validateGenderBlock(gender, block, msgEl) {
        if (block === GIRLS_BLOCK && gender !== 'Female') {
            showMessage(msgEl, 'Error: GH1 is a girls-only hostel. Only female students can be allotted to GH1.', false);
            return false;
        }
        return true;
    }

    // Search filter
    searchBar.addEventListener('input', () => {
        const query = searchBar.value.trim().toLowerCase();
        tableBody.querySelectorAll('tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(query) ? '' : 'none';
        });
    });

    // Fetch allotments table
    async function fetchAllotments() {
        try {
            const response = await fetch('/api/g44/allotments');
            if (!response.ok) return;
            const allotments = await response.json();

            tableBody.innerHTML = '';
            searchBar.value = '';

            if (allotments.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#94a3b8; padding:20px;">No allotments found.</td></tr>`;
                return;
            }

            allotments.forEach(a => {
                let statusClass = 'G44-status-allotted';
                if (a.status === 'Pending Transfer') statusClass = 'G44-status-transfer';
                if (a.status === 'Vacated')          statusClass = 'G44-status-vacated';

                const acBadge   = a.acType === 'AC'
                    ? `<span class="G44-badge G44-badge-ac">AC</span>`
                    : `<span class="G44-badge G44-badge-nonac">Non-AC</span>`;

                const typeBadge = a.roomType === 'Double'
                    ? `<span class="G44-badge G44-badge-double">Double</span>`
                    : `<span class="G44-badge G44-badge-single">Single</span>`;

                const vacateBtn = a.status !== 'Vacated'
                    ? `<button class="G44-btn-vacate" onclick="vacateStudent('${a.studentId}')">Vacate</button>`
                    : `<span style="color:#94a3b8;">—</span>`;

                tableBody.innerHTML += `
                    <tr>
                        <td>${a.studentId}</td>
                        <td><strong>${a.block}</strong></td>
                        <td>${a.roomNumber}</td>
                        <td>${typeBadge}</td>
                        <td>${acBadge}</td>
                        <td>${a.academicYear}</td>
                        <td class="${statusClass}">${a.status}</td>
                        <td>${vacateBtn}</td>
                    </tr>`;
            });

        } catch (error) {
            console.error('Error fetching allotments:', error);
        }
    }

    // Assign form
    allotForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const studentId    = document.getElementById('studentId').value.trim().toUpperCase();
        const gender       = document.getElementById('gender').value;
        const block        = document.getElementById('block').value;
        const academicYear = document.getElementById('academicYear').value;
        const roomNumber   = document.getElementById('roomNumber').value.trim();
        const roomType     = document.querySelector('input[name="roomType"]:checked')?.value;
        const acType       = document.querySelector('input[name="acType"]:checked')?.value;

        if (!roomType) { showMessage(allotMsg, 'Error: Please select a Room Type.', false); return; }
        if (!acType)   { showMessage(allotMsg, 'Error: Please select AC or Non-AC.', false); return; }
        if (!validateGenderBlock(gender, block, allotMsg)) return;

        try {
            const response = await fetch('/api/g44/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, gender, block, roomNumber, roomType, acType, academicYear })
            });
            const result = await response.json();

            if (response.ok) {
                showMessage(allotMsg, result.message, true);
                allotForm.reset();
                document.querySelectorAll('input[name="acType"]').forEach(r => { r.disabled = false; });
                document.getElementById('acRadioGroup').style.opacity = '1';
            } else {
                showMessage(allotMsg, result.message, false);
            }
        } catch {
            showMessage(allotMsg, 'Error: Failed to connect to the server.', false);
        }
    });

    // Transfer form
    transferForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const studentId     = document.getElementById('transferStudentId').value.trim().toUpperCase();
        const gender        = document.getElementById('transferGender').value;
        const block         = document.getElementById('transferBlock').value;
        const newRoomNumber = document.getElementById('newRoomNumber').value.trim();
        const roomType      = document.querySelector('input[name="transferRoomType"]:checked')?.value;
        const acType        = document.querySelector('input[name="transferAcType"]:checked')?.value;

        if (!roomType) { showMessage(transferMsg, 'Error: Please select a Room Type.', false); return; }
        if (!acType)   { showMessage(transferMsg, 'Error: Please select AC or Non-AC.', false); return; }
        if (!validateGenderBlock(gender, block, transferMsg)) return;

        try {
            const response = await fetch('/api/g44/transfer', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, gender, newRoomNumber, block, roomType, acType })
            });
            const result = await response.json();

            if (response.ok) {
                showMessage(transferMsg, result.message, true);
                transferForm.reset();
                document.querySelectorAll('input[name="transferAcType"]').forEach(r => { r.disabled = false; });
                document.getElementById('transferAcRadioGroup').style.opacity = '1';
            } else {
                showMessage(transferMsg, result.message, false);
            }
        } catch {
            showMessage(transferMsg, 'Error: Failed to connect to the server.', false);
        }
    });

    // Vacate
    window.vacateStudent = async (studentId) => {
        if (!confirm(`Are you sure you want to vacate the room for ${studentId}?`)) return;

        try {
            const response = await fetch('/api/g44/vacate', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId })
            });
            const result = await response.json();
            if (response.ok) { alert(result.message); fetchAllotments(); }
            else              { alert(result.message); }
        } catch {
            alert('Error: Failed to connect to the server.');
        }
    };

});