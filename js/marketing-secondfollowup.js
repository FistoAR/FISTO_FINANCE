const SECOND_FOLLOWUP_API_BASE = 'https://www.fist-o.com/fisto_finance_app/api/followups';

let secondFollowUps = [];
let selectedSecondContactIndex = 0;

const secondFollowupStatusOptions = ['Drop', 'Follow up'];

// FETCH SECOND FOLLOW-UPS FROM BACKEND
async function fetchSecondFollowUps() {
    try {
        console.log('🔄 Fetching second follow-ups...');
        const response = await fetch(`${SECOND_FOLLOWUP_API_BASE}/get_followups.php`);
        const result = await response.json();
        
        if (result.success && result.followups) {
            // Filter only "Need To follow up" status for Second Follow-up tab
            secondFollowUps = result.followups.filter(f => 
    f.status === 'Need To follow up' || f.status === 'Follow up'
);
            console.log('✅ Loaded second follow-ups:', secondFollowUps.length);
            renderSecondFollowUpTable();
        } else {
            throw new Error(result.message || 'Failed to load second follow-ups');
        }
    } catch (error) {
        console.error('❌ Error fetching second follow-ups:', error);
        CommonModal.error('Failed to load second follow-ups from database', 'Error');
        secondFollowUps = [];
        renderSecondFollowUpTable();
    }
}

// RENDER SECOND FOLLOW-UP TABLE
function renderSecondFollowUpTable() {
    const tbody = document.getElementById('secondfollowupTableBody');
    if (!tbody) return;

    if (secondFollowUps.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2rem; color: #64748b;">
                    No second follow-ups yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = secondFollowUps.map(followUp => {
        const updateDate = followUp.updateDate !== '-' ? formatSecondDisplayDate(followUp.updateDate) : '-';
        const nextDate = followUp.nextFollowUpDate !== '-' ? formatSecondDisplayDate(followUp.nextFollowUpDate) : '-';
        const initiatedDate = formatSecondDisplayDate(followUp.initiatedDate);

        return `
            <tr data-customer-id="${followUp.customerDbId}">
                <td>
                    <div class="custom-dropdown" data-followup-id="${followUp.customerDbId}">
                        <button class="custom-dropdown-btn" onclick="toggleSecondFollowupDropdown(${followUp.customerDbId})" type="button">
                            <span class="selected-value">${followUp.status}</span>
                            <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <div class="custom-dropdown-menu" id="second-followup-dropdown-${followUp.customerDbId}">
                            ${secondFollowupStatusOptions.map(option => `
                                <div class="dropdown-item ${followUp.status === option ? 'active' : ''}" 
                                    onclick="selectSecondFollowupStatus(${followUp.customerDbId}, '${option}')">
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
                    <button class="followup-view-btn" onclick="openSecondFollowupViewModal(${followUp.customerDbId})" type="button">
                        <img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon">
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// FORMAT DATE HELPER
function formatSecondDisplayDate(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    }).replace(/ /g, ' ').toUpperCase();
}

// DROPDOWN FUNCTIONS
function toggleSecondFollowupDropdown(customerDbId) {
    const dropdown = document.getElementById(`second-followup-dropdown-${customerDbId}`);
    const allDropdowns = document.querySelectorAll('.custom-dropdown-menu');
    
    allDropdowns.forEach(dd => {
        if (dd.id !== `second-followup-dropdown-${customerDbId}`) {
            dd.classList.remove('show');
        }
    });
    
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// TOGGLE ACTION SECTION
function toggleActionSection(actionType) {
    const infoSection = document.getElementById('informationSharedSection');
    
    if (actionType === 'information_shared') {
        infoSection.style.display = 'block';
    } else {
        infoSection.style.display = 'none';
        // Clear checkboxes when switching to "Move to Lead"
        document.getElementById('sharedWhatsapp').checked = false;
        document.getElementById('sharedMail').checked = false;
    }
}

function selectSecondFollowupStatus(customerDbId, status) {
    const followUp = secondFollowUps.find(f => f.customerDbId === customerDbId);
    if (!followUp) return;
    
    const btn = document.querySelector(`[data-followup-id="${customerDbId}"] .selected-value`);
    if (btn) {
        btn.textContent = status;
    }

    const dropdown = document.getElementById(`second-followup-dropdown-${customerDbId}`);
    if (dropdown) {
        dropdown.classList.remove('show');
    }

    followUp.status = status;
    
    openSecondFollowupUpdateModal(customerDbId, status);
}

// UPDATE MODAL
function openSecondFollowupUpdateModal(customerDbId, status) {
    const followUp = secondFollowUps.find(f => f.customerDbId === customerDbId);
    if (!followUp) return;

    const modal = document.getElementById('updateSecondFollowupModal');
    if (!modal) return;

    document.getElementById('updateSecondFollowupModalTitle').textContent = status;
    document.getElementById('updateSecondFollowupId').value = customerDbId;
    document.getElementById('updateSecondFollowupStatus').value = status;
    document.getElementById('updateSecondFollowupCompanyName').value = followUp.companyName;
    document.getElementById('updateSecondFollowupCustomerName').value = followUp.customerName;

    // Generate contact radio buttons
    const contactRadioContainer = document.getElementById('secondContactRadioContainer');
    const contacts = followUp.contacts || [];
    
    if (contacts.length > 0) {
        contactRadioContainer.innerHTML = `
            <div class="second-contact-radio-group">
                ${contacts.map((contact, index) => `
                    <label class="second-contact-radio-label">
                        <input 
                            type="radio" 
                            name="secondContact" 
                            value="${index}" 
                            class="contact-radio" 
                            onchange="showSecondContactDetails(${customerDbId}, ${index})"
                            ${index === 0 ? 'checked' : ''}
                        />
                        <span>${contact.person || 'Contact ' + (index + 1)} (${contact.phone || 'No phone'})</span>
                    </label>
                `).join('')}
            </div>
        `;
        
        selectedSecondContactIndex = 0;
        showSecondContactDetails(customerDbId, 0);
    } else {
        contactRadioContainer.innerHTML = '<p style="color: #64748b; font-size: 0.8vw;">No contact information available</p>';
        document.getElementById('selectedSecondContactDetails').style.display = 'none';
    }

    // Load action state
    loadActionState(customerDbId);

    const remarksField = document.getElementById('updateSecondFollowupRemarks');
    const nextDateField = document.getElementById('updateSecondFollowupNextDate');
    const nextDateGroup = document.getElementById('nextFollowUpDateGroup');

    // Show/hide fields based on status
    if (status === 'Drop') {
        remarksField.closest('.second-followup-form-group').style.display = 'block';
        nextDateGroup.style.display = 'none';
    } else if (status === 'Follow up') {
        remarksField.closest('.second-followup-form-group').style.display = 'block';
        nextDateGroup.style.display = 'block';
    }

    remarksField.value = '';
    const today = new Date().toISOString().split('T')[0];
    nextDateField.value = today;

    modal.style.display = 'flex';
}

// LOAD ACTION STATE
function loadActionState(customerDbId) {
    const followUp = secondFollowUps.find(f => f.customerDbId === customerDbId);
    if (!followUp) return;

    // Reset radio buttons and action section visibility
    document.getElementById('actionInformationShared').checked = false;
    document.getElementById('actionMoveToLead').checked = false;
    document.getElementById('informationSharedSection').style.display = 'none';

    // Reset checkboxes
    const whatsappCheckbox = document.getElementById('sharedWhatsapp');
    const mailCheckbox = document.getElementById('sharedMail');
    whatsappCheckbox.checked = false;
    whatsappCheckbox.disabled = false;
    mailCheckbox.checked = false;
    mailCheckbox.disabled = false;

    // Load saved action state
    if (followUp.actionType) {
        if (followUp.actionType === 'information_shared') {
            document.getElementById('actionInformationShared').checked = true;
            document.getElementById('informationSharedSection').style.display = 'block';

            if (followUp.sharedWhatsapp === true) {
                whatsappCheckbox.checked = true;
                whatsappCheckbox.disabled = true;  // Disable to prevent editing
            }
            if (followUp.sharedMail === true) {
                mailCheckbox.checked = true;
                mailCheckbox.disabled = true;  // Disable to prevent editing
            }
        } else if (followUp.actionType === 'move_to_lead') {
            document.getElementById('actionMoveToLead').checked = true;
        }
    }
}


function showSecondContactDetails(customerDbId, contactIndex) {
    const followUp = secondFollowUps.find(f => f.customerDbId === customerDbId);
    if (!followUp || !followUp.contacts || !followUp.contacts[contactIndex]) return;

    selectedSecondContactIndex = contactIndex;

    const contact = followUp.contacts[contactIndex];
    const detailsContainer = document.getElementById('selectedSecondContactDetails');
    
    document.getElementById('selectedSecondContactPerson').value = contact.person || '';
    document.getElementById('selectedSecondContactPhone').value = contact.phone || '';
    document.getElementById('selectedSecondContactEmail').value = contact.email || '';
    document.getElementById('selectedSecondContactDesignation').value = contact.designation || '';
    
    detailsContainer.style.display = 'block';
}

function closeSecondFollowupUpdateModal() {
    const modal = document.getElementById('updateSecondFollowupModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// SUBMIT UPDATE (FIXED)
async function submitSecondFollowupUpdate(event) {
    event.preventDefault();

    const customerDbId = parseInt(document.getElementById('updateSecondFollowupId').value);
    const status = document.getElementById('updateSecondFollowupStatus').value;
    const remarksField = document.getElementById('updateSecondFollowupRemarks');
    const nextDateField = document.getElementById('updateSecondFollowupNextDate');
    const nextDateGroup = document.getElementById('nextFollowUpDateGroup');

    const remarks = remarksField.value.trim();
    const nextFollowUpDate = nextDateGroup.style.display !== 'none' ? nextDateField.value : null;

    // Get action type
    let actionType = null;
    let sharedWhatsapp = false;
    let sharedMail = false;
    let moveToLead = false;

    if (document.getElementById('actionInformationShared').checked) {
        actionType = 'information_shared';
        sharedWhatsapp = document.getElementById('sharedWhatsapp').checked;
        sharedMail = document.getElementById('sharedMail').checked;
    } else if (document.getElementById('actionMoveToLead').checked) {
        actionType = 'move_to_lead';
        moveToLead = true;
    }

    // Get selected contact
    const followUp = secondFollowUps.find(f => f.customerDbId === customerDbId);
    let selectedContact = null;

    if (followUp && followUp.contacts && followUp.contacts.length > 0 && selectedSecondContactIndex !== null) {
        const contact = followUp.contacts[selectedSecondContactIndex];
        if (contact) {
            selectedContact = {
                person: contact.person || null,
                phone: contact.phone || null,
                email: contact.email || null,
                designation: contact.designation || null
            };
        }
    }

    
    
    // FIX: Pass all parameters including action variables
    await updateSecondFollowupStatus(
        customerDbId, 
        status, 
        remarks, 
        nextFollowUpDate, 
        selectedContact, 
        actionType, 
        sharedWhatsapp, 
        sharedMail, 
        moveToLead
    );

    closeSecondFollowupUpdateModal();
}

// UPDATE STATUS TO BACKEND (FIXED)
async function updateSecondFollowupStatus(customerDbId, status, remarks, nextFollowUpDate, selectedContact, actionType, sharedWhatsapp, sharedMail, moveToLead) {
    const followUp = secondFollowUps.find(f => f.customerDbId === customerDbId);
    if (!followUp) {
        CommonModal.error('Follow-up record not found', 'Error');
        return;
    }

    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    const employeeId = storedUser.employee_id || null;

    try {
        // FIX: Use "Moved to Lead" status to prevent it from appearing in any follow-up tabs
        const finalStatus = moveToLead ? 'Moved to Lead' : status;
        
        const payload = {
            customer_db_id: customerDbId,
            status: finalStatus,
            remarks,
            next_followup_date: nextFollowUpDate,
            employee_id: employeeId,
            contact_person: selectedContact ? selectedContact.person : null,
            contact_phone: selectedContact ? selectedContact.phone : null,
            contact_email: selectedContact ? selectedContact.email : null,
            contact_designation: selectedContact ? selectedContact.designation : null,
            action_type: actionType,
            shared_whatsapp: sharedWhatsapp,
            shared_mail: sharedMail,
            move_to_lead: moveToLead
        };

        const response = await fetch(`${SECOND_FOLLOWUP_API_BASE}/update_status.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            if (moveToLead) {
                // Remove from secondFollowUps array immediately
                secondFollowUps = secondFollowUps.filter(f => f.customerDbId !== customerDbId);

                // Prepare lead data object for save API
                const leadData = {
                    customer_db_id: followUp.customerDbId,
                    company_name: followUp.companyName,
                    customer_name: followUp.customerName,
                    industry_type: followUp.industryType,
                    website: followUp.website,
                    address: followUp.address,
                    city: followUp.city,
                    reference: followUp.reference,
                    remarks: remarks || followUp.currentRemarks,
                    project_name: followUp.projectName,
                    project_category: followUp.projectCategory,
                    requirement: followUp.requirement,
                    status: 'Lead',
                    contacts: followUp.contacts || []
                };

                const leadResp = await fetch('https://www.fist-o.com/fisto_finance_app/api/leads/save_lead.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(leadData)
                });

                const leadResult = await leadResp.json();

                if (leadResult.success) {
                    CommonModal.success(`Successfully moved ${followUp.companyName} to Leads!`);
                    
                    // Refresh leads table
                    if (typeof window.fetchLeads === 'function') {
                        await window.fetchLeads();
                    }
                } else {
                    CommonModal.error('Failed to save lead after move.');
                }
            } else {
                // Update local data for Drop or Follow up status
                followUp.status = finalStatus;
                followUp.currentRemarks = remarks;
                followUp.updateDate = new Date().toISOString().split('T')[0];
                followUp.nextFollowUpDate = nextFollowUpDate;
                followUp.actionType = actionType;
                followUp.sharedWhatsapp = sharedWhatsapp;
                followUp.sharedMail = sharedMail;
                
                CommonModal.success(`Second follow-up ${status === 'Drop' ? 'dropped' : 'updated'} successfully!`);
            }

            // Refresh second follow-ups list UI
            await fetchSecondFollowUps();

            // Refresh main follow-ups table if available
            if (typeof window.fetchFollowUps === 'function') {
                await window.fetchFollowUps();
            }
        } else {
            throw new Error(result.message || 'Failed to update second follow-up');
        }
    } catch (error) {
        console.error('❌ Error updating second follow-up:', error);
        CommonModal.error('Error updating second follow-up: ' + error.message, 'Update Error');
        await fetchSecondFollowUps();
    }
}





// VIEW MODAL
async function openSecondFollowupViewModal(customerDbId) {
    const followUp = secondFollowUps.find(f => f.customerDbId === customerDbId);
    if (!followUp) {
        CommonModal.error('Follow-up record not found', 'Error');
        return;
    }

    const modal = document.getElementById('secondfollowupdetailsModal');
    if (!modal) return;

    document.getElementById('viewSecondFollowupDate').value = formatSecondDisplayDate(followUp.date) || '';
    document.getElementById('viewSecondFollowupCustomerID').value = followUp.customerID || '';
    document.getElementById('viewSecondFollowupCompanyName').value = followUp.companyName || '';
    document.getElementById('viewSecondFollowupCustomerName').value = followUp.customerName || '';
    document.getElementById('viewSecondFollowupIndustryType').value = followUp.industryType || '';
    document.getElementById('viewSecondFollowupWebsite').value = followUp.website || '';
    document.getElementById('viewSecondFollowupAddress').value = followUp.address || '';
    document.getElementById('viewSecondFollowupCity').value = followUp.city || '';
    document.getElementById('viewSecondFollowupReference').value = followUp.reference || '';
    document.getElementById('viewSecondFollowupRemarks').value = followUp.remarks || '';
    document.getElementById('viewSharedWhatsapp').checked = !!followUp.sharedWhatsapp;
    document.getElementById('viewSharedMail').checked = !!followUp.sharedMail;


    const contactsContainer = document.getElementById('viewSecondFollowupContactsContainer');
    if (followUp.contacts && followUp.contacts.length > 0) {
        contactsContainer.innerHTML = followUp.contacts.map((contact, index) => `
            <div class="second-followup-contact-card">
                <div class="second-followup-contact-title">Contact ${index + 1}</div>
                <div class="second-followup-contact-row">
                    <div class="second-followup-contact-group">
                        <label>Contact Person</label>
                        <input type="text" value="${contact.person || ''}" readonly />
                    </div>
                    <div class="second-followup-contact-group">
                        <label>Phone Number</label>
                        <input type="text" value="${contact.phone || ''}" readonly />
                    </div>
                    <div class="second-followup-contact-group">
                        <label>Mail ID</label>
                        <input type="email" value="${contact.email || ''}" readonly />
                    </div>
                    <div class="second-followup-contact-group">
                        <label>Designation</label>
                        <input type="text" value="${contact.designation || ''}" readonly />
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        contactsContainer.innerHTML = `<p style="text-align: center; color: #64748B; padding: 1rem;">No contact information available</p>`;
    }

    document.getElementById('viewSecondFollowupProjectName').value = followUp.projectName || '';
    document.getElementById('viewSecondFollowupProjectCategory').value = followUp.projectCategory || '';
    document.getElementById('viewSecondFollowupRequirement').value = followUp.requirement || '';

    // Fetch history
    const history = await fetchSecondFollowUpHistory(followUp.customerID);
    const historyBody = document.getElementById('secondFollowupHistoryTableBody');

    if (history.length > 0) {
        historyBody.innerHTML = history.map(record => `
            <tr>
                <td style="text-align: center;">${formatSecondDisplayDate(record.updateDate)}</td>
                <td>${record.status}</td>
                <td>${record.companyName}</td>
                <td style="text-align: center;">${record.contactPerson || '-'}</td>
                <td style="text-align: center;">${record.contactPhone || '-'}</td>
                <td style="text-align: center;">${record.contactEmail || '-'}</td>
                <td style="text-align: center;">${record.contactDesignation || '-'}</td>
                <td style="text-align: center;">${formatSecondDisplayDate(record.nextFollowUpDate)}</td>
                <td>${record.remarks}</td>
                 <td style="text-align: center;">${record.employeeName || 'N/A'}</td>
            </tr>
        `).join('');
    } else {
        historyBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 1.5rem; color: #64748b;">
                    No follow-up history yet
                </td>
            </tr>
        `;
    }

    modal.style.display = 'flex';
}

async function fetchSecondFollowUpHistory(customerId) {
    try {
        const response = await fetch(`${SECOND_FOLLOWUP_API_BASE}/get_history.php?customer_id=${customerId}`);
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

function closeSecondFollowupViewModal() {
    const modal = document.getElementById('secondfollowupdetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Second Follow-up: DOM loaded');
    fetchSecondFollowUps();
});

document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('tab-btn')) {
        const tabName = e.target.getAttribute('data-tab');
        if (tabName === 'second-follow-up') {
            setTimeout(fetchSecondFollowUps, 50);
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
    const updateModal = document.getElementById('updateSecondFollowupModal');
    const viewModal = document.getElementById('secondfollowupdetailsModal');
    
    if (event.target === updateModal) {
        closeSecondFollowupUpdateModal();
    }
    if (event.target === viewModal) {
        closeSecondFollowupViewModal();
    }
});

// Global functions
window.toggleSecondFollowupDropdown = toggleSecondFollowupDropdown;
window.selectSecondFollowupStatus = selectSecondFollowupStatus;
window.openSecondFollowupUpdateModal = openSecondFollowupUpdateModal;
window.closeSecondFollowupUpdateModal = closeSecondFollowupUpdateModal;
window.submitSecondFollowupUpdate = submitSecondFollowupUpdate;
window.openSecondFollowupViewModal = openSecondFollowupViewModal;
window.closeSecondFollowupViewModal = closeSecondFollowupViewModal;
window.showSecondContactDetails = showSecondContactDetails;
window.renderSecondFollowUpTable = renderSecondFollowUpTable;
window.toggleActionSection = toggleActionSection;
window.loadActionState = loadActionState;

console.log('✅ Second Follow-up module loaded with backend integration!');
