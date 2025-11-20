const FOLLOWUP_API_BASE = 'https://www.fist-o.com/fisto_finance_app/api/followups';

let followUps = [];
let followUpHistories = {};
let noneHidden = {};
let selectedContactIndex = 0;
let currentCustomerDbId = null;

const statusOptions = [ 'Not Picking / Not Reachable', 'Not Interested / Not Needed', 'Need To follow up', 'Follow up Later', 'Not available'];

// FETCH FOLLOW-UPS FROM BACKEND
// FETCH FOLLOW-UPS FROM BACKEND
async function fetchFollowUps() {
    try {
        console.log('🔄 Fetching follow-ups...');
        const response = await fetch(`${FOLLOWUP_API_BASE}/get_followups.php`);
        const result = await response.json();
        
        if (result.success && result.followups) {
            followUps = result.followups;
            console.log('✅ Loaded follow-ups:', followUps.length);
            
            // Render both tables
            renderFollowUpTable();
            if (typeof renderNotInterestTable === 'function') {
                renderNotInterestTable();
            }
        } else {
            throw new Error(result.message || 'Failed to load follow-ups');
        }
    } catch (error) {
        console.error('❌ Error fetching follow-ups:', error);
        CommonModal.error('Failed to load follow-ups from database', 'Error');
        followUps = [];
        
        renderFollowUpTable();
        if (typeof renderNotInterestTable === 'function') {
            renderNotInterestTable();
        }
    }
}

// FETCH FOLLOW-UP HISTORY
async function fetchFollowUpHistory(customerId) {
    try {
        const response = await fetch(`${FOLLOWUP_API_BASE}/get_history.php?customer_id=${customerId}`);
        const result = await response.json();
        
        if (result.success) {
            return result.history || [];
        } else {
            throw new Error(result.message || 'Failed to load history');
        }
    } catch (error) {
        console.error('❌ Error fetching history:', error);
        return [];
    }
}



// RENDER TABLE
// RENDER TABLE - Show all records EXCEPT "Not Interested / Not Needed"
// RENDER TABLE - Show all records EXCEPT "Not Interested / Not Needed"
function renderFollowUpTable() {
    const tbody = document.getElementById('followupTableBody');
    if (!tbody) return;

    const EXCLUDED_STATUSES = [
        'Not Interested / Not Needed',
        'Not Interested',
        'Not Interest',
        'Not Interested / Not Need',
        'Need To follow up',
        'Follow up',
        'Drop',
        'Moved to Lead'  // ADD THIS LINE
    ];
    
    const followUpRecords = followUps.filter(f => 
        !EXCLUDED_STATUSES.includes((f.status || '').trim())
    );

    if (followUpRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: #64748b;">
                    No follow-ups yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = followUpRecords.map(followUp => {
        const updateDate = followUp.updateDate !== '-' ? formatDisplayDate(followUp.updateDate) : '-';
        const nextDate = followUp.nextFollowUpDate !== '-' ? formatDisplayDate(followUp.nextFollowUpDate) : '-';
        const initiatedDate = formatDisplayDate(followUp.initiatedDate);

        const filteredOptions = statusOptions.filter(option => {
            if (option === 'None' && noneHidden[followUp.customerDbId]) {
                return false;
            }
            return true;
        });

        return `
            <tr>
                <td>
                    <div class="custom-dropdown" data-followup-id="${followUp.customerDbId}">
                        <button class="custom-dropdown-btn" onclick="toggleFollowupDropdown(${followUp.customerDbId})" type="button">
                            <span class="selected-value">${followUp.status}</span>
                            <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <div class="custom-dropdown-menu" id="followup-dropdown-${followUp.customerDbId}">
                            ${filteredOptions.map(option => `
                                <div class="dropdown-item ${followUp.status === option ? 'active' : ''}" 
                                    onclick="selectFollowupStatus(${followUp.customerDbId}, '${option}')">
                                    ${option}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </td>
                <td>
                    <div style="color: #64748b; font-size: 0.9em; padding: 4px 0;">
                        ${followUp.status}
                    </div>
                </td>
                <td>${followUp.currentRemarks}</td>
                <td style="text-align: center;">${updateDate}</td>
                <td style="text-align: center;">${nextDate}</td>
                <td style="text-align: center;">${followUp.customerID}</td>
                <td style="text-align: center;">${initiatedDate}</td>
                <td>${followUp.companyName}</td>
                <td>${followUp.customerName}</td>
                <td style="text-align: center;">
                    <button class="followup-view-btn" onclick="openFollowupViewModal(${followUp.customerDbId})" type="button">
                        <img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon">
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}


// FORMAT DATE HELPER
function formatDisplayDate(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    }).replace(/ /g, ' ').toUpperCase();
}

// CUSTOM DROPDOWN FUNCTIONS
function toggleFollowupDropdown(customerDbId) {
    const dropdown = document.getElementById(`followup-dropdown-${customerDbId}`);
    const allDropdowns = document.querySelectorAll('.custom-dropdown-menu');
    
    allDropdowns.forEach(dd => {
        if (dd.id !== `followup-dropdown-${customerDbId}`) {
            dd.classList.remove('show');
        }
    });
    
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function selectFollowupStatus(customerDbId, status) {
    const followUp = followUps.find(f => f.customerDbId === customerDbId);
    if (!followUp) return;
    
    const btn = document.querySelector(`[data-followup-id="${customerDbId}"] .selected-value`);
if (btn) {
    btn.textContent = status;
}

const dropdown = document.getElementById(`followup-dropdown-${customerDbId}`);
if (dropdown) {
    dropdown.classList.remove('show');
}

// Update the status in the followUp object
followUp.status = status;

// Update status display below dropdown
const statusDisplay = document.getElementById(`selected-status-${customerDbId}`);
if (statusDisplay) {
    statusDisplay.textContent = status;
}

// Hide None option if any status other than None is selected
if (status !== 'None') {
    noneHidden[customerDbId] = true;
}

if (status === 'None') {
    followUp.status = 'None';
    followUp.currentRemarks = '-';
    followUp.updateDate = '-';
    followUp.nextFollowUpDate = '-';
    
    renderFollowUpTable();
    return;
}

openFollowupUpdateModal(customerDbId, status);

}


// UPDATE STATUS TO BACKEND
// UPDATE STATUS TO BACKEND
async function updateFollowupStatus(customerDbId, status, remarks, nextFollowUpDate, selectedContact) {
  const followUp = followUps.find(f => f.customerDbId === customerDbId);
  if (!followUp) {
    CommonModal.error('Follow-up record not found', 'Error');
    return;
  }

  const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  const employeeId = storedUser.employee_id || null;

  try {
    const payload = {
      customer_db_id: customerDbId,
      status: status,
      remarks: remarks,
      next_followup_date: nextFollowUpDate,
      employee_id: employeeId,
      contact_person: selectedContact ? selectedContact.person : null,
      contact_phone: selectedContact ? selectedContact.phone : null,
      contact_email: selectedContact ? selectedContact.email : null,
      contact_designation: selectedContact ? selectedContact.designation : null
    };

    const response = await fetch(`${FOLLOWUP_API_BASE}/update_status.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      // Update local data
      followUp.status = status;
      followUp.currentRemarks = remarks;
      followUp.updateDate = new Date().toISOString().split('T')[0];
      followUp.nextFollowUpDate = nextFollowUpDate;
      
      CommonModal.success('Follow-up updated successfully!');
      
      // Re-render BOTH tables to sync tabs
      renderFollowUpTable();
      if (typeof renderNotInterestTable === 'function') {
        renderNotInterestTable();
      }
      if (typeof renderSecondFollowUpTable === 'function') {
        renderSecondFollowUpTable();
      }
    } else {
      throw new Error(result.message || 'Failed to update follow-up');
    }
  } catch (error) {
    console.error('❌ Error updating follow-up:', error);
    CommonModal.error('Error updating follow-up: ' + error.message, 'Update Error');
    
    // Re-render on error too
    renderFollowUpTable();
    if (typeof renderNotInterestTable === 'function') {
      renderNotInterestTable();
    }
    if (typeof renderSecondFollowUpTable === 'function') {
    renderSecondFollowUpTable();
    }
  }
}




// UPDATE MODAL
function openFollowupUpdateModal(customerDbId, status) {
    const followUp = followUps.find(f => f.customerDbId === customerDbId);
    if (!followUp) return;

    const modal = document.getElementById('updateFollowupModal');
    if (!modal) return;

    document.getElementById('updateFollowupModalTitle').textContent = status;
    document.getElementById('updateFollowupId').value = customerDbId;
    document.getElementById('updateFollowupStatus').value = status;
    document.getElementById('updateFollowupCompanyName').value = followUp.companyName;
    document.getElementById('updateFollowupCustomerName').value = followUp.customerName;

    
    // Generate contact radio buttons
    const contactRadioContainer = document.getElementById('contactRadioContainer');
    const contacts = followUp.contacts || [];
    
      if (contacts.length > 0) {
        contactRadioContainer.innerHTML = `
            <div class="contact-radio-group">
                ${contacts.map((contact, index) => `
                    <label class="contact-radio-label">
                        <input 
                            type="radio" 
                            name="contact" 
                            value="${index}" 
                            class="contact-radio" 
                            onchange="showContactDetails(${customerDbId}, ${index})"
                            ${index === 0 ? 'checked' : ''}
                        />
                        <span>${contact.person || 'Contact ' + (index + 1)} (${contact.phone || 'No phone'})</span>
                    </label>
                `).join('')}
            </div>
        `;
        
        // Show first contact details by default
        selectedContactIndex = 0;
        showContactDetails(customerDbId, 0);
    } else {
        contactRadioContainer.innerHTML = '<p style="color: #64748b;">No contact information available</p>';
        document.getElementById('selectedContactDetails').style.display = 'none';
    }

    const remarksField = document.getElementById('updateFollowupRemarks');
    const nextDateField = document.getElementById('updateFollowupNextDate');

    // Hide None option in dropdown
    const noneOption = document.querySelector('.dropdown-item[data-status="None"]');
    if (noneOption) {
        noneOption.style.display = 'none';
    }

    // Show/hide fields based on status
    if (status === 'Not Picking / Not Reachable') {
        remarksField.closest('.followup-form-group').style.display = 'none';
        nextDateField.closest('.followup-form-group').style.display = 'block';
    } else if (status === 'Not Interested / Not Needed' || status === 'Not available') {
        remarksField.closest('.followup-form-group').style.display = 'block';
        nextDateField.closest('.followup-form-group').style.display = 'none';
    } else {
        remarksField.closest('.followup-form-group').style.display = 'block';
        nextDateField.closest('.followup-form-group').style.display = 'block';
    }

    remarksField.value = '';
    const today = new Date().toISOString().split('T')[0];
    nextDateField.value = today;

    modal.style.display = 'flex';
}

function showContactDetails(customerDbId, contactIndex) {
    const followUp = followUps.find(f => f.customerDbId === customerDbId);
    if (!followUp || !followUp.contacts || !followUp.contacts[contactIndex]) return;

    selectedContactIndex = contactIndex;

    const contact = followUp.contacts[contactIndex];
    const detailsContainer = document.getElementById('selectedContactDetails');
    
    document.getElementById('selectedContactPerson').value = contact.person || '';
    document.getElementById('selectedContactPhone').value = contact.phone || '';
    document.getElementById('selectedContactEmail').value = contact.email || '';
    document.getElementById('selectedContactDesignation').value = contact.designation || '';
    
    detailsContainer.style.display = 'block';
}


function closeFollowupUpdateModal() {
    const modal = document.getElementById('updateFollowupModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function submitFollowupUpdate(event) {
    event.preventDefault();

    const customerDbId = parseInt(document.getElementById('updateFollowupId').value);
    const status = document.getElementById('updateFollowupStatus').value;
    const remarksField = document.getElementById('updateFollowupRemarks');
    const nextDateField = document.getElementById('updateFollowupNextDate');

    const remarks = remarksField.closest('.followup-form-group').style.display !== 'none' ? remarksField.value.trim() : '';
    const nextFollowUpDate = nextDateField.closest('.followup-form-group').style.display !== 'none' ? nextDateField.value : null;

    // Get selected contact details
    const followUp = followUps.find(f => f.customerDbId === customerDbId);
    let selectedContact = null;

    if (followUp && followUp.contacts && followUp.contacts.length > 0 && selectedContactIndex !== null) {
        const contact = followUp.contacts[selectedContactIndex];
        if (contact) {
            selectedContact = {
                person: contact.person || null,
                phone: contact.phone || null,
                email: contact.email || null,
                designation: contact.designation || null
            };
        }
    }

    closeFollowupUpdateModal();
    await updateFollowupStatus(customerDbId, status, remarks, nextFollowUpDate, selectedContact);
}



// VIEW DETAILS MODAL
async function openFollowupViewModal(customerDbId) {
    const followUp = followUps.find(f => f.customerDbId === customerDbId);
    if (!followUp) {
        CommonModal.error('Follow-up record not found', 'Error');
        return;
    }

    const modal = document.getElementById('viewFollowupDetailsModal');
    if (!modal) return;

    document.getElementById('viewFollowupDate').value = formatDisplayDate(followUp.date) || '';
    document.getElementById('viewFollowupCustomerID').value = followUp.customerID || '';
    document.getElementById('viewFollowupCompanyName').value = followUp.companyName || '';
    document.getElementById('viewFollowupCustomerName').value = followUp.customerName || '';
    document.getElementById('viewFollowupIndustryType').value = followUp.industryType || '';
    document.getElementById('viewFollowupWebsite').value = followUp.website || '';
    document.getElementById('viewFollowupAddress').value = followUp.address || '';
    document.getElementById('viewFollowupCity').value = followUp.city || '';
    document.getElementById('viewFollowupReference').value = followUp.reference || '';
    document.getElementById('viewFollowupRemarks').value = followUp.remarks || '';

    const contactsContainer = document.getElementById('viewFollowupContactsContainer');
    if (followUp.contacts && followUp.contacts.length > 0) {
        contactsContainer.innerHTML = followUp.contacts.map((contact, index) => `
            <div class="followup-contact-block">
                <div class="followup-contact-title">Contact ${index + 1}</div>
                <div class="followup-form-grid followup-form-grid-4">
                    <div class="followup-form-group">
                        <label>Contact Person</label>
                        <input type="text" value="${contact.person || ''}" readonly />
                    </div>
                    <div class="followup-form-group">
                        <label>Phone Number</label>
                        <input type="text" value="${contact.phone || ''}" readonly />
                    </div>
                    <div class="followup-form-group">
                        <label>Mail ID</label>
                        <input type="email" value="${contact.email || ''}" readonly />
                    </div>
                    <div class="followup-form-group">
                        <label>Designation</label>
                        <input type="text" value="${contact.designation || ''}" readonly />
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        contactsContainer.innerHTML = `<p style="text-align: center; color: #64748B; padding: 1rem;">No contact information available</p>`;
    }

    document.getElementById('viewFollowupProjectName').value = followUp.projectName || '';
    document.getElementById('viewFollowupProjectCategory').value = followUp.projectCategory || '';
    document.getElementById('viewFollowupRequirement').value = followUp.requirement || '';

    const history = await fetchFollowUpHistory(followUp.customerID);
    const historyBody = document.getElementById('followupHistoryTableBody');

    if (history.length > 0) {
        historyBody.innerHTML = history.map(record => `
            <tr>
                <td style="text-align: center;">${formatDisplayDate(record.updateDate)}</td>
                <td>${record.status}</td>
                <td>${record.companyName}</td>
                <td style="text-align: center;">${record.contactPerson || '-'}</td>
                <td style="text-align: center;">${record.contactPhone || '-'}</td>
                <td style="text-align: center;">${record.contactEmail || '-'}</td>
                <td style="text-align: center;">${record.contactDesignation || '-'}</td>
                <td style="text-align: center;">${formatDisplayDate(record.nextFollowUpDate)}</td>
                <td>${record.remarks}</td>
                <td style="text-align: center;">${record.employeeName || 'N/A'}</td>
            </tr>
        `).join('');
    } else {
        historyBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 1.5rem; color: #64748b;">
                    No follow-up history yet
                </td>
            </tr>
        `;
    }

    modal.style.display = 'flex';
}


function closeFollowupViewModal() {
    const modal = document.getElementById('viewFollowupDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Follow-up: DOM loaded');
    fetchFollowUps();
});

document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('tab-btn')) {
        const tabName = e.target.getAttribute('data-tab');
        if (tabName === 'follow-up') {
            setTimeout(fetchFollowUps, 50);
        }
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.custom-dropdown-menu').forEach(dd => {
            dd.classList.remove('show');
        });
    }
});

// Close modals on outside click
window.addEventListener('click', function(event) {
    const updateModal = document.getElementById('updateFollowupModal');
    const viewModal = document.getElementById('viewFollowupDetailsModal');
    
    if (event.target === updateModal) {
        closeFollowupUpdateModal();
    }
    if (event.target === viewModal) {
        closeFollowupViewModal();
    }
});

// Global functions
window.toggleFollowupDropdown = toggleFollowupDropdown;
window.selectFollowupStatus = selectFollowupStatus;
window.openFollowupUpdateModal = openFollowupUpdateModal;
window.closeFollowupUpdateModal = closeFollowupUpdateModal;
window.submitFollowupUpdate = submitFollowupUpdate;
window.openFollowupViewModal = openFollowupViewModal;
window.closeFollowupViewModal = closeFollowupViewModal;
window.showContactDetails = showContactDetails;
window.fetchFollowUps = fetchFollowUps;


console.log('✅ Follow-up module loaded with backend integration!');
