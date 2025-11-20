const LEADS_API_BASE = 'https://www.fist-o.com/fisto_finance_app/api/leads';
const FILES_BASE_URL = 'https://www.fist-o.com/fisto_finance_app/uploads/lead/'; 


let leads = [];
let leadHistories = { status: {}, quotation: {}, leadUpdates: {} };
const leadStatusOptions = ['None', 'Proposal', 'Quotation', 'Drop', 'Follow Up', 'Lead'];

/* ---------------------------
   SAVE HISTORY TO BACKEND
   --------------------------- */
async function saveLeadHistory(leadId, status, historyType, historyData) {
    // Retrieve logged-in employee_id from session storage
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    console.log("Logged user in session:", storedUser);
    const employeeId = storedUser.employee_id || null;
    console.log("Employee ID from sessionStorage:", employeeId);

    const payload = {
        lead_id: leadId,
        status: status,
        history_type: historyType,
        employee_id: employeeId,  // pass employee_id
        ...historyData
    };

    try {
        console.log('💾 Saving history:', payload);
        const response = await fetch(`${LEADS_API_BASE}/save_history.php`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ History saved successfully');
        } else {
            console.error('❌ Failed to save history:', result.message);
            CommonModal.error('Failed to save history: ' + result.message);
        }
    } catch (error) {
        console.error('❌ Error saving history:', error);
        CommonModal.error('Error saving history: ' + error.message);
    }
}


/* ---------------------------
   FETCH HISTORY FROM BACKEND
   --------------------------- */
async function fetchLeadHistory(leadId) {
    try {
        console.log('🔄 Fetching history for lead:', leadId);
        const response = await fetch(`${LEADS_API_BASE}/get_history.php?lead_id=${leadId}`);
        const result = await response.json();

        if (result.success) {
            // Update local histories
            leadHistories.status[leadId] = result.statusHistory || [];
            leadHistories.quotation[leadId] = result.quotationHistory || [];
            leadHistories.leadUpdates[leadId] = result.leadUpdatesHistory || [];

            console.log('✅ History fetched successfully');
            return result;
        } else {
            console.error('❌ Failed to fetch history:', result.message);
            return { statusHistory: [], quotationHistory: [], leadUpdatesHistory: [] };
        }
    } catch (error) {
        console.error('❌ Error fetching history:', error);
        return { statusHistory: [], quotationHistory: [], leadUpdatesHistory: [] };
    }
}

/* ---------------------------
   FETCH / RENDER
   --------------------------- */
async function fetchLeads() {
    try {
        console.log('🔄 Fetching leads from server...');
        const resp = await fetch(`${LEADS_API_BASE}/get_leads.php`, { cache: 'no-store' });

        console.log('HTTP status:', resp.status, resp.statusText);
        const raw = await resp.text();
        console.log('RAW RESPONSE:', raw);

        let data = null;
        try {
            data = JSON.parse(raw);
            console.log('PARSED JSON:', data);
        } catch (err) {
            console.error('❌ JSON parse error:', err);
            console.error('Invalid JSON returned by server. Check raw response above.');
            renderLeadTable();
            return;
        }

        if (!data || typeof data !== 'object') {
            console.error('❌ Response parsed but not an object:', data);
            renderLeadTable();
            return;
        }

        if (!data.success) {
            console.warn('⚠️ API returned success=false:', data.message);
            renderLeadTable();
            return;
        }

        if (!Array.isArray(data.leads)) {
            console.error('❌ API returned success but no leads array:', data);
            renderLeadTable();
            return;
        }

        leads = (data.leads || []).map(normalizeLeadFromServer);
        console.log(`✅ Fetched ${leads.length} leads from server`);
        leads.forEach(l => initLeadHistories(l.id));
        renderLeadTable();
    } catch (err) {
        console.error('❌ Network/fetch error:', err);
        renderLeadTable();
    }
}
window.fetchLeads = fetchLeads;

function normalizeLeadFromServer(l) {
    return {
        id: l.id,
        status: l.status || 'None',
        date: l.date || formatDateFromDb(l.created_at || l.updated_at || l.date),
        customerID: l.customerID || l.customer_id || '',
        customerDbId: l.customerDbId || l.customer_db_id || null,
        companyName: l.companyName || l.company_name || '',
        customerName: l.customerName || l.customer_name || '',
        industryType: l.industryType || l.industry_type || '',
        website: l.website || '',
        address: l.address || '',
        city: l.city || '',
        reference: l.reference || '',
        remarks: l.remarks || '',
        contacts: Array.isArray(l.contacts) ? l.contacts : (l.contacts_json ? JSON.parse(l.contacts_json) : []),
        projectName: l.projectName || l.project_name || '',
        projectCategory: l.projectCategory || l.project_category || '',
        requirement: l.requirement || '',
        startDate: l.startDate || l.start_date || '',
        completionDate: l.completionDate || l.completion_date || '',
        reviewDate: l.reviewDate || l.review_date || ''
    };
}

function initLeadHistories(id) {
    if (!leadHistories.status[id]) leadHistories.status[id] = [];
    if (!leadHistories.quotation[id]) leadHistories.quotation[id] = [];
    if (!leadHistories.leadUpdates[id]) leadHistories.leadUpdates[id] = [];
}

function renderLeadTable() {
    const tbody = document.getElementById('leadTableBody');
    if (!tbody) return;

    if (leads.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:#64748b;">No leads yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = leads.map(lead => `
        <tr>
            <td>
                <div class="lead-custom-dropdown" data-lead-id="${lead.id}">
                    <button class="lead-custom-dropdown-btn" onclick="toggleLeadDropdown(${lead.id})" type="button">
                        <span class="lead-selected-value">${escapeHtml(lead.status)}</span>
                        <svg class="lead-dropdown-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    <div class="lead-custom-dropdown-menu" id="lead-dropdown-${lead.id}">
                        ${leadStatusOptions.map(option => `
                            <div class="lead-dropdown-item ${lead.status === option ? 'active' : ''}" onclick="selectLeadStatus(${lead.id}, '${option}')">
                                ${option}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </td>
            <td>${escapeHtml(lead.companyName)}</td>
            <td>${escapeHtml(lead.projectName)}</td>
            <td>${escapeHtml(lead.projectCategory)}</td>
            <td>${escapeHtml(lead.requirement)}</td>
            <td style="text-align:center;">${lead.startDate || '-'}</td>
            <td style="text-align:center;">${lead.completionDate || '-'}</td>
            <td style="text-align:center;">${lead.reviewDate || '-'}</td>
            <td style="text-align:center;">
                <button class="lead-view-btn" onclick="openLeadViewModal(${lead.id})" type="button">
                    <img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon">
                </button>
            </td>
        </tr>
    `).join('');
}

/* ---------------------------
   APPEND NEW LEAD (IMMEDIATE UI)
   --------------------------- */
function appendSavedLeadToUI(leadResult, followUp, remarks) {
    if (!leadResult || !leadResult.lead_id) return;

    const newLead = {
        id: parseInt(leadResult.lead_id),
        status: 'Lead',
        date: getCurrentDate(),
        customerID: followUp.customerID || ('LEAD' + leadResult.lead_id),
        customerDbId: followUp.customerDbId || followUp.customer_db_id || followUp.customerDbId || null,
        companyName: followUp.companyName || '',
        customerName: followUp.customerName || '',
        industryType: followUp.industryType || '',
        website: followUp.website || '',
        address: followUp.address || '',
        city: followUp.city || '',
        reference: followUp.reference || '',
        remarks: remarks || followUp.currentRemarks || '',
        contacts: Array.isArray(followUp.contacts) ? followUp.contacts : [],
        projectName: followUp.projectName || '',
        projectCategory: followUp.projectCategory || '',
        requirement: followUp.requirement || '',
        startDate: followUp.startDate || '',
        completionDate: followUp.completionDate || '',
        reviewDate: followUp.reviewDate || ''
    };

    leads = leads.filter(l => !(l.customerDbId && newLead.customerDbId && l.customerDbId === newLead.customerDbId) && l.id !== newLead.id);
    leads.unshift(newLead);
    initLeadHistories(newLead.id);
    renderLeadTable();
    CommonModal.success(`Lead created: ${escapeHtml(newLead.companyName)}`);
}

/* ---------------------------
   Helpers (escape, dates)
   --------------------------- */
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function formatDateFromDb(dbDateStr) {
    if (!dbDateStr) return '';
    const d = new Date(dbDateStr);
    if (isNaN(d.getTime())) return dbDateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ').toUpperCase();
}

function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ').toUpperCase();
}

/* ---------------------------
   UI helpers: dropdowns, select status
   --------------------------- */
function toggleLeadDropdown(leadId) {
    const dropdown = document.getElementById(`lead-dropdown-${leadId}`);
    const allDropdowns = document.querySelectorAll('.lead-custom-dropdown-menu');
    allDropdowns.forEach(dd => { if (dd.id !== `lead-dropdown-${leadId}`) dd.classList.remove('show'); });
    if (dropdown) dropdown.classList.toggle('show');
}

function selectLeadStatus(leadId, status) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) { CommonModal.error('Lead record not found', 'Error'); return; }
    const btn = document.querySelector(`[data-lead-id="${leadId}"] .lead-selected-value`);
    if (btn) btn.textContent = status;
    const dropdown = document.getElementById(`lead-dropdown-${leadId}`);
    if (dropdown) dropdown.classList.remove('show');

    if (status === 'None') {
        CommonModal.confirm(`Are you sure you want to reset the status for ${lead.companyName}?`, 'Reset Status', function () {
            lead.status = 'None'; renderLeadTable(); CommonModal.success('Lead status reset successfully');
        }, function () { renderLeadTable(); });
        return;
    }
    if (status === 'Proposal') openProposalModal(leadId);
    else if (status === 'Quotation') openQuotationModal(leadId);
    else if (status === 'Drop') openDropModal(leadId);
    else if (status === 'Lead') openLeadStatusModal(leadId);
    else if (status === 'Follow Up') openInProgressModal(leadId);
}

/* ---------------------------
   Modal open/close & view modal
   --------------------------- */
function openProposalModal(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const modal = document.getElementById('proposalModal');
    if (!modal) return;
    document.getElementById('proposalLeadId').value = leadId;
    document.getElementById('proposalCompanyName').value = lead.companyName || '';
    document.getElementById('proposalCustomerName').value = lead.customerName || '';
    document.getElementById('proposalRemarks').value = '';
    document.getElementById('proposalNextDate').value = '';
    modal.style.display = 'flex';
}

function openQuotationModal(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const modal = document.getElementById('quotationModal');
    if (!modal) return;
    document.getElementById('quotationLeadId').value = leadId;
    document.getElementById('quotationCompanyName').value = lead.companyName || '';
    document.getElementById('quotationCustomerName').value = lead.customerName || '';
    document.getElementById('quotationRemarks').value = '';
    document.getElementById('quotationNextDate').value = '';
    modal.style.display = 'flex';
}

function openDropModal(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const modal = document.getElementById('dropModal');
    if (!modal) return;
    document.getElementById('dropLeadId').value = leadId;
    document.getElementById('dropCompanyName').value = lead.companyName || '';
    document.getElementById('dropCustomerName').value = lead.customerName || '';
    document.getElementById('dropRemarks').value = '';
    document.getElementById('dropNextDate').value = '';
    modal.style.display = 'flex';
}

function openLeadStatusModal(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const modal = document.getElementById('leadStatusModal');
    if (!modal) return;
    document.getElementById('leadStatusLeadId').value = leadId;
    document.getElementById('leadCompanyName').value = lead.companyName || '';
    document.getElementById('leadProjectName').value = lead.projectName || '';
    document.getElementById('leadProjectCategory').value = lead.projectCategory || '';
    document.getElementById('leadRequirement').value = lead.requirement || '';
    document.getElementById('leadStartDate').value = '';
    document.getElementById('leadCompletionDate').value = '';
    document.getElementById('leadReviewDate').value = '';
    modal.style.display = 'flex';
}

function openInProgressModal(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const modal = document.getElementById('inProgressModal');
    if (!modal) return;
    document.getElementById('inProgressLeadId').value = leadId;
    document.getElementById('inProgressCompanyName').value = lead.companyName || '';
    document.getElementById('inProgressCustomerName').value = lead.customerName || '';
    document.getElementById('inProgressRemarks').value = '';
    document.getElementById('inProgressNextDate').value = '';
    modal.style.display = 'flex';
}

async function openLeadViewModal(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
        CommonModal.error('Lead record not found', 'Error');
        return;
    }
    const modal = document.getElementById('viewLeadDetailsModal');
    if (!modal) return;

    // Populate lead info fields with safe fallback
    document.getElementById('viewLeadDate').value = lead.date || '';
    document.getElementById('viewLeadCustomerID').value = lead.customerID || '';
    document.getElementById('viewLeadCompanyName').value = lead.companyName || '';
    document.getElementById('viewLeadCustomerName').value = lead.customerName || '';
    document.getElementById('viewLeadIndustryType').value = lead.industryType || '';
    document.getElementById('viewLeadWebsite').value = lead.website || '';
    document.getElementById('viewLeadAddress').value = lead.address || '';
    document.getElementById('viewLeadCity').value = lead.city || '';
    document.getElementById('viewLeadReference').value = lead.reference || '';
    document.getElementById('viewLeadRemarks').value = lead.remarks || '';

    // Render contacts safely, fallback if none
    const contactsContainer = document.getElementById('viewLeadContactsContainer');
    if (lead.contacts && lead.contacts.length > 0) {
        contactsContainer.innerHTML = lead.contacts.map((contact, index) => `
            <div class="lead-contact-block">
                <div class="lead-contact-title">Contact ${index + 1}</div>
                <div class="lead-form-grid-2">
                    <div class="lead-form-group">
                        <label>Contact Person</label>
                        <input type="text" value="${escapeHtml(contact.person || '')}" readonly />
                    </div>
                    <div class="lead-form-group">
                        <label>Phone Number</label>
                        <input type="text" value="${escapeHtml(contact.phone || '')}" readonly />
                    </div>
                    <div class="lead-form-group">
                        <label>Mail ID</label>
                        <input type="email" value="${escapeHtml(contact.email || '')}" readonly />
                    </div>
                    <div class="lead-form-group">
                        <label>Designation</label>
                        <input type="text" value="${escapeHtml(contact.designation || '')}" readonly />
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        contactsContainer.innerHTML = `<p style="text-align:center;color:#64748B;padding:1rem;">No contact information available</p>`;
    }

    // Populate more lead project-related fields
    document.getElementById('viewLeadProjectName').value = lead.projectName || '';
    document.getElementById('viewLeadProjectCategory').value = lead.projectCategory || '';
    document.getElementById('viewLeadRequirement').value = lead.requirement || '';
    document.getElementById('viewLeadStartDate').value = lead.startDate || '';
    document.getElementById('viewLeadCompletionDate').value = lead.completionDate || '';
    document.getElementById('viewLeadReviewDate').value = lead.reviewDate || '';

    // Await fetching histories from backend
    await fetchLeadHistory(leadId);

    // Render status history table
    const statusHistoryBody = document.getElementById('leadStatusHistoryTableBody');
    const statusHistory = leadHistories.status[leadId] || [];
    statusHistoryBody.innerHTML = statusHistory.length > 0
        ? statusHistory.map(r => `
            <tr>
                <td style="text-align:center">${formatDateFromDb(r.updatedDate)}</td>
                <td>${r.status}</td>
                <td>${r.companyName}</td>
                <td style="text-align:center">${r.nextDate || '-'}</td>
                <td>${r.remarks || '-'}</td>
                <td>${r.employeeName || 'N/A'}</td>
            </tr>`).join('')
        : `<tr><td colspan="5" style="text-align:center; padding: 1.5rem; color: #64748b;">No status updates yet</td></tr>`;

    // Render quotation history table
   const quotationHistoryBody = document.getElementById('leadQuotationHistoryTableBody');
const quotationHistory = leadHistories.quotation[leadId] || [];
quotationHistoryBody.innerHTML = quotationHistory.length > 0
    ? quotationHistory.map(q => {
        const poButton = q.po && q.po !== '-'
    ? `<button class="file-open-btn" type="button" onclick="window.open('${FILES_BASE_URL}${encodeURIComponent(q.po)}', '_blank')">View PO</button>`
    : '-';
const invoiceButton = q.invoice && q.invoice !== '-'
    ? `<button class="file-open-btn" type="button" onclick="window.open('${FILES_BASE_URL}${encodeURIComponent(q.invoice)}', '_blank')">View Invoice</button>`
    : '-';
        return `
            <tr>
                <td style="text-align:center">${formatDateFromDb(q.updatedDate)}</td>
                <td>${q.status}</td>
                <td>${q.companyName}</td>
                <td style="text-align:center">${q.nextDate || '-'}</td>
                <td>${q.remarks || '-'}</td>
                <td style="text-align:center">${poButton}</td>
                <td style="text-align:center">${invoiceButton}</td>
                <td>${q.employeeName || 'N/A'}</td>
            </tr>
        `;
    }).join('')
    : `<tr><td colspan="7" style="text-align:center; padding: 1.5rem; color: #64748b;">No quotation history yet</td></tr>`;

    // Render lead updates history table
    const leadUpdatesHistoryBody = document.getElementById('leadUpdatesHistoryTableBody');
    const leadUpdatesHistory = leadHistories.leadUpdates[leadId] || [];
    leadUpdatesHistoryBody.innerHTML = leadUpdatesHistory.length > 0
        ? leadUpdatesHistory.map(lu => `
            <tr>
                <td style="text-align:center">${formatDateFromDb(lu.updatedDate)}</td>
                <td>${lu.status}</td>
                <td>${lu.companyName}</td>
                <td>${lu.projectCategory}</td>
                <td>${lu.requirement}</td>
                <td style="text-align:center">${lu.startDate || '-'}</td>
                <td style="text-align:center">${lu.completionDate || '-'}</td>
                <td style="text-align:center">${lu.reviewDate || '-'}</td>
                <td>${lu.employeeName || 'N/A'}</td>
            </tr>`).join('')
        : `<tr><td colspan="8" style="text-align:center; padding: 1.5rem; color: #64748b;">No lead updates yet</td></tr>`;

    // Show modal
    modal.style.display = 'flex';
}



function closeLeadModal(modalType) {
    const modals = {
        'proposal': 'proposalModal',
        'quotation': 'quotationModal',
        'drop': 'dropModal',
        'leadStatus': 'leadStatusModal',
        'inProgress': 'inProgressModal',
        'viewDetails': 'viewLeadDetailsModal'
    };
    const modalId = modals[modalType];
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

/* ---------------------------
   FORM SUBMISSIONS (WITH BACKEND SAVE)
   --------------------------- */

async function submitProposal(event) {
    event.preventDefault();
    const leadId = parseInt(document.getElementById('proposalLeadId').value);
    const lead = leads.find(l => l.id === leadId);
    if (!lead) { CommonModal.error('Lead record not found', 'Error'); return; }

    const remarks = document.getElementById('proposalRemarks').value.trim();
    const nextDate = document.getElementById('proposalNextDate').value;

    if (!remarks) { CommonModal.error('Please enter remarks for the proposal', 'Validation Error'); return; }

    lead.status = 'Proposal';
    
    // Save to backend
    await saveLeadHistory(leadId, 'Proposal', 'status', {
        company_name: lead.companyName,
        remarks: remarks,
        next_followup_date: nextDate || null
    });

    // Update local history
    if (!leadHistories.status[leadId]) leadHistories.status[leadId] = [];
    leadHistories.status[leadId].push({
        updatedDate: getCurrentDate(),
        status: 'Proposal',
        companyName: lead.companyName,
        remarks: remarks,
        nextDate: nextDate ? formatDate(nextDate) : '-'
    });

    closeLeadModal('proposal');
    renderLeadTable();
    CommonModal.success(`Proposal submitted for ${lead.companyName}!`);
}


async function uploadFile(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await fetch(`${LEADS_API_BASE}/upload_file.php`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            return result.savedFileName; // or whatever your API returns
        } else {
            CommonModal.error('File upload failed: ' + result.message);
            return null;
        }
    } catch (err) {
        CommonModal.error('File upload error: ' + err.message);
        return null;
    }
}

async function submitQuotation(event) {
    event.preventDefault();
    const leadId = parseInt(document.getElementById('quotationLeadId').value);
    const lead = leads.find(l => l.id === leadId);
    if (!lead) { CommonModal.error('Lead record not found', 'Error'); return; }

    const remarks = document.getElementById('quotationRemarks').value.trim();
    const nextDate = document.getElementById('quotationNextDate').value;
    const poFile = document.getElementById('quotationPO') ? document.getElementById('quotationPO').files[0] : null;
    const invoiceFile = document.getElementById('quotationInvoice') ? document.getElementById('quotationInvoice').files[0] : null;

    if (!remarks) { CommonModal.error('Please enter remarks for the quotation', 'Validation Error'); return; }

    // Upload files separately
    const savedPOFileName = await uploadFile(poFile);
    const savedInvoiceFileName = await uploadFile(invoiceFile);

    lead.status = 'Quotation';

    await saveLeadHistory(leadId, 'Quotation', 'quotation', {
        company_name: lead.companyName,
        remarks: remarks,
        next_followup_date: nextDate || null,
        po_file: savedPOFileName,
        invoice_file: savedInvoiceFileName
    });

    if (!leadHistories.quotation[leadId]) leadHistories.quotation[leadId] = [];
    leadHistories.quotation[leadId].push({
        updatedDate: getCurrentDate(),
        status: 'Quotation',
        companyName: lead.companyName,
        remarks: remarks,
        nextDate: nextDate ? formatDate(nextDate) : '-',
        po: savedPOFileName || '-',
        invoice: savedInvoiceFileName || '-'
    });

    closeLeadModal('quotation');
    renderLeadTable();
    CommonModal.success(`Quotation submitted for ${lead.companyName}!`);
}

async function submitDrop(event) {
    event.preventDefault();
    const leadId = parseInt(document.getElementById('dropLeadId').value);
    const lead = leads.find(l => l.id === leadId);
    if (!lead) { CommonModal.error('Lead record not found', 'Error'); return; }

    const remarks = document.getElementById('dropRemarks').value.trim();
    const nextDate = document.getElementById('dropNextDate').value;

    if (!remarks) { CommonModal.error('Please enter reason for dropping this lead', 'Validation Error'); return; }

    CommonModal.confirm(`Are you sure you want to drop the lead for ${lead.companyName}?`, 'Drop Lead', async function () {
        lead.status = 'Drop';
        
        // Save to backend
        await saveLeadHistory(leadId, 'Drop', 'status', {
            company_name: lead.companyName,
            remarks: remarks,
            next_followup_date: nextDate || null
        });

        // Update local history
        if (!leadHistories.status[leadId]) leadHistories.status[leadId] = [];
        leadHistories.status[leadId].push({
            updatedDate: getCurrentDate(),
            status: 'Drop',
            companyName: lead.companyName,
            remarks: remarks,
            nextDate: nextDate ? formatDate(nextDate) : '-'
        });

        closeLeadModal('drop');
        renderLeadTable();
        CommonModal.success(`Lead dropped for ${lead.companyName}`);
    }, function () {
        closeLeadModal('drop');
        renderLeadTable();
    });
}

async function submitLeadStatus(event) {
    event.preventDefault();
    const leadId = parseInt(document.getElementById('leadStatusLeadId').value);
    const lead = leads.find(l => l.id === leadId);
    if (!lead) { CommonModal.error('Lead record not found', 'Error'); return; }

    const companyName = document.getElementById('leadCompanyName').value.trim();
    const projectName = document.getElementById('leadProjectName').value.trim();
    const projectCategory = document.getElementById('leadProjectCategory').value.trim();
    const requirement = document.getElementById('leadRequirement').value.trim();
    const startDate = document.getElementById('leadStartDate').value;
    const completionDate = document.getElementById('leadCompletionDate').value;
    const reviewDate = document.getElementById('leadReviewDate').value;

    if (!projectName) { CommonModal.error('Please enter project name', 'Validation Error'); return; }
    if (!startDate || !completionDate || !reviewDate) { CommonModal.error('Please select all dates (Start, Completion, Review)', 'Validation Error'); return; }

    const start = new Date(startDate), completion = new Date(completionDate), review = new Date(reviewDate);
    if (completion < start) { CommonModal.error('Completion date cannot be before start date', 'Invalid Date'); return; }
    if (review < completion) { CommonModal.error('Review date cannot be before completion date', 'Invalid Date'); return; }

    lead.companyName = companyName;
    lead.projectName = projectName;
    lead.projectCategory = projectCategory;
    lead.requirement = requirement;
    if (startDate) lead.startDate = formatDate(startDate);
    if (completionDate) lead.completionDate = formatDate(completionDate);
    if (reviewDate) lead.reviewDate = formatDate(reviewDate);

    lead.status = 'Lead';
    
    // Save to backend
    await saveLeadHistory(leadId, 'Lead', 'lead_updates', {
        company_name: companyName,
        project_name: projectName,
        project_category: projectCategory,
        requirement: requirement,
        start_date: startDate,
        completion_date: completionDate,
        review_date: reviewDate
    });

    // Update local history
    if (!leadHistories.leadUpdates[leadId]) leadHistories.leadUpdates[leadId] = [];
    leadHistories.leadUpdates[leadId].push({
        updatedDate: getCurrentDate(),
        status: 'Lead',
        companyName: companyName,
        nextDate: '-',
        remarks: '-',
        projectCategory: projectCategory,
        requirement: requirement,
        startDate: startDate ? formatDate(startDate) : '-',
        completionDate: completionDate ? formatDate(completionDate) : '-',
        reviewDate: reviewDate ? formatDate(reviewDate) : '-'
    });

    closeLeadModal('leadStatus');
    renderLeadTable();
    CommonModal.success(`Lead status updated for ${companyName}!`);
}

async function submitInProgress(event) {
    event.preventDefault();
    const leadId = parseInt(document.getElementById('inProgressLeadId').value);
    const lead = leads.find(l => l.id === leadId);
    if (!lead) { CommonModal.error('Lead record not found', 'Error'); return; }

    const remarks = document.getElementById('inProgressRemarks').value.trim();
    const nextDate = document.getElementById('inProgressNextDate').value;

    if (!remarks) { CommonModal.error('Please enter progress remarks', 'Validation Error'); return; }

    lead.status = 'Follow Up';
    
    // Save to backend
    await saveLeadHistory(leadId, 'Follow Up', 'status', {
        company_name: lead.companyName,
        remarks: remarks,
        next_followup_date: nextDate || null
    });

    // Update local history
    if (!leadHistories.status[leadId]) leadHistories.status[leadId] = [];
    leadHistories.status[leadId].push({
        updatedDate: getCurrentDate(),
        status: 'Follow Up',
        companyName: lead.companyName,
        remarks: remarks,
        nextDate: nextDate ? formatDate(nextDate) : '-'
    });

    closeLeadModal('inProgress');
    renderLeadTable();
    CommonModal.success(`Lead marked as Follow Up for ${lead.companyName}!`);
}

/* ---------------------------
   Utility functions reused by forms
   --------------------------- */
function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ').toUpperCase();
}

/* ---------------------------
   Initialization & event wiring
   --------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    console.log('Lead: DOM loaded (marketing-lead.js)');
    fetchLeads();

    const proposalForm = document.getElementById('proposalForm');
    if (proposalForm) proposalForm.onsubmit = submitProposal;

    const quotationForm = document.getElementById('quotationForm');
    if (quotationForm) quotationForm.onsubmit = submitQuotation;

    const dropForm = document.getElementById('dropForm');
    if (dropForm) dropForm.onsubmit = submitDrop;

    const leadStatusForm = document.getElementById('leadStatusForm');
    if (leadStatusForm) leadStatusForm.onsubmit = submitLeadStatus;

    const inProgressForm = document.getElementById('inProgressForm');
    if (inProgressForm) inProgressForm.onsubmit = submitInProgress;
});

document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('tab-btn')) {
        const tabName = e.target.getAttribute('data-tab');
        if (tabName === 'lead') {
            setTimeout(renderLeadTable, 50);
        }
    }
});

document.addEventListener('click', function (event) {
    if (!event.target.closest('.lead-custom-dropdown')) {
        document.querySelectorAll('.lead-custom-dropdown-menu').forEach(dd => dd.classList.remove('show'));
    }
});

window.addEventListener('click', function (event) {
    const modals = ['proposalModal', 'quotationModal', 'dropModal', 'leadStatusModal', 'inProgressModal', 'viewLeadDetailsModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) modal.style.display = 'none';
    });
});

/* ---------------------------
   Expose functions globally (for inline onclick handlers)
   --------------------------- */
window.toggleLeadDropdown = toggleLeadDropdown;
window.selectLeadStatus = selectLeadStatus;
window.openProposalModal = openProposalModal;
window.openQuotationModal = openQuotationModal;
window.openDropModal = openDropModal;
window.openLeadStatusModal = openLeadStatusModal;
window.openInProgressModal = openInProgressModal;
window.openLeadViewModal = openLeadViewModal;
window.closeLeadModal = closeLeadModal;
window.submitProposal = submitProposal;
window.submitQuotation = submitQuotation;
window.submitDrop = submitDrop;
window.submitLeadStatus = submitLeadStatus;
window.submitInProgress = submitInProgress;
window.renderLeadTable = renderLeadTable;

console.log('✅ marketing-lead.js loaded with backend integration');

document.addEventListener('DOMContentLoaded', function () {
    // Existing code ...
    function handleFileInputChange(inputId, placeholderSelector) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.addEventListener('change', () => {
            const fileName = input.files.length > 0 ? input.files[0].name : '';
            const placeholder = input.parentElement.querySelector(placeholderSelector);
            if (placeholder) {
                if (fileName) {
                    // Show file name with upload SVG icon
                    placeholder.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; width: 1em; height: 1em; fill: currentColor; margin-right: 0.3em;" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zm7-14l-5 5h3v4h4v-4h3l-5-5z"/></svg>
                        ${fileName}
                    `;
                } else {
                    // Reset placeholder text
                    placeholder.textContent = inputId === 'quotationPO' ? 'Upload Po' : 'Upload Invoice';
                }
            }
        });
    }

    handleFileInputChange('quotationPO', '.file-placeholder');
    handleFileInputChange('quotationInvoice', '.file-placeholder');
});

