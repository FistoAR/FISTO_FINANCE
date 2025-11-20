/* =================================== 
   PROJECT BUDGET - COMPLETE JAVASCRIPT 
   With Leads Integration & Payment Tracking
   =================================== */

// ==================== GLOBAL VARIABLES ====================
const API_BASE_URL2 =
  "https://www.fist-o.com/fisto_finance_app/api/budget/project/";
let currentLeads = [];
let currentLeadId = null;
let currentPayments = [];
let currentDocuments = [];

// ==================== INITIALIZATION ====================
function initializeProjectBudget() {
  console.log("Initializing Project Budget...");
  loadLeads();
  setupEventListeners();
  console.log("Project Budget initialized successfully!");
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Close modals on backdrop click
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("project-budget-modal-overlay")) {
      closeProjectModal();
    }
  });
}

// ==================== API CALLS ====================

// Load all leads
async function loadLeads() {
  try {
    showLoader();
    const response = await fetch(`${API_BASE_URL2}get_leads.php`);
    const result = await response.json();

    if (result.success) {
      currentLeads = result.data;
      renderLeadsTable(result.data);
    } else {
      showError(result.message);
    }
  } catch (error) {
    console.error("Error loading leads:", error);
    showError("Failed to load leads");
  } finally {
    hideLoader();
  }
}

// Get lead details with budget and payments
async function getLeadDetails(leadId) {
  try {
    showLoader();
    const response = await fetch(
      `${API_BASE_URL2}get_lead_details.php?lead_id=${leadId}`
    );
    const result = await response.json();

    if (result.success) {
      return result;
    } else {
      showError(result.message);
      return null;
    }
  } catch (error) {
    console.error("Error loading lead details:", error);
    showError("Failed to load lead details");
    return null;
  } finally {
    hideLoader();
  }
}

// Save project budget
async function saveProjectBudget(leadId, budgetData) {
  try {
    showLoader();
    budgetData.lead_id = leadId;

    const response = await fetch(`${API_BASE_URL2}save_project_budget.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(budgetData),
    });

    const result = await response.json();

    if (result.success) {
      showSuccess(result.message);
      return true;
    } else {
      showError(result.message);
      return false;
    }
  } catch (error) {
    console.error("Error saving budget:", error);
    showError("Failed to save budget");
    return false;
  } finally {
    hideLoader();
  }
}

// Add payment
async function addPayment(paymentData) {
  try {
    showLoader();
    const response = await fetch(`${API_BASE_URL2}add_payment.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (result.success) {
      showSuccess(result.message);
      return result.data;
    } else {
      showError(result.message);
      return null;
    }
  } catch (error) {
    console.error("Error adding payment:", error);
    showError("Failed to add payment");
    return null;
  } finally {
    hideLoader();
  }
}

// Delete payment
async function deletePayment(paymentId) {
  try {
    showLoader();
    const response = await fetch(`${API_BASE_URL2}delete_payment.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: paymentId }),
    });

    const result = await response.json();

    if (result.success) {
      showSuccess(result.message);
      return true;
    } else {
      showError(result.message);
      return false;
    }
  } catch (error) {
    console.error("Error deleting payment:", error);
    showError("Failed to delete payment");
    return false;
  } finally {
    hideLoader();
  }
}

// Upload document
async function uploadDocument(leadId, file, documentType) {
  try {
    showLoader();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lead_id", leadId);
    formData.append("document_type", documentType);

    const response = await fetch(
      `${API_BASE_URL2}upload_project_document.php`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (result.success) {
      showSuccess(result.message);
      return result.data;
    } else {
      showError(result.message);
      return null;
    }
  } catch (error) {
    console.error("Error uploading document:", error);
    showError("Failed to upload document");
    return null;
  } finally {
    hideLoader();
  }
}

// Delete document
async function deleteDocument(docId) {
  try {
    showLoader();
    const response = await fetch(
      `${API_BASE_URL2}delete_project_document.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: docId }),
      }
    );

    const result = await response.json();

    if (result.success) {
      showSuccess(result.message);
      return true;
    } else {
      showError(result.message);
      return false;
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    showError("Failed to delete document");
    return false;
  } finally {
    hideLoader();
  }
}

// ==================== RENDER FUNCTIONS ====================

// Render leads table
function renderLeadsTable(leads) {
    const tbody = document.querySelector('.project-budget-table tbody');
    if (!tbody) {
        console.error('Table body not found!');
        return;
    }
    
    if (leads.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    No projects found.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = leads.map((lead, index) => `
        <tr>
            <td>${String(index + 1).padStart(2, '0')}</td>
            <td>${escapeHtml(lead.companyName)}</td>
            <td>${escapeHtml(lead.customerName)}</td>
            <td>${escapeHtml(lead.projectName)}</td>
            <td>${escapeHtml(lead.projectCategory)}</td>
            <td>
                <button class="project-budget-add-btn" onclick="openAddModal(${lead.id})">
                    + Add
                </button>
            </td>
            
        </tr>
    `).join('');
}


// ==================== MODAL FUNCTIONS ====================

// Open Add Modal
async function openAddModal(leadId) {
  currentLeadId = leadId;
  const details = await getLeadDetails(leadId);

  if (!details) return;

  createOrUpdateModal(details, "add");
}

// Open View Modal
async function openViewModal(leadId) {
  currentLeadId = leadId;
  const details = await getLeadDetails(leadId);

  if (!details) return;

  createOrUpdateModal(details, "view");
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-IN', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}


// Create or Update Modal
// Create or Update Modal
function createOrUpdateModal(details, mode) {
    const { lead, budget, payments, documents } = details;
    currentPayments = payments || [];
    currentDocuments = documents || [];
    
    const isViewMode = mode === 'view';
    const readonly = isViewMode ? 'readonly' : '';
    const disabled = isViewMode ? 'disabled' : '';
    
    // Remove existing modal
    const existingModal = document.querySelector('.project-budget-modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'project-budget-modal-overlay active';
    modal.innerHTML = `
        <div class="project-budget-modal">
            <!-- Header -->
            <div class="project-budget-modal-header">
                <h3>${isViewMode ? 'View' : 'Add'} Project</h3>
                <button class="modal-close-btn" onclick="closeProjectModal()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <!-- Body -->
            <div class="project-budget-modal-body">
                <!-- Project Information Section -->
                <div class="project-budget-section">
                    <div class="section-header">
                        <img src="/FISTO_FINANCE/assets/images/projectB_icon.webp" alt="">
                        <h4>Project Information</h4>
                    </div>
                    <div class="form-grid-3">
                        <div class="form-group">
                            <label>Company Name <span class="required">*</span></label>
                            <input type="text" value="${escapeHtml(lead.companyName)}" readonly class="form-control-readonly">
                        </div>
                        <div class="form-group">
                            <label>Customer Name <span class="required">*</span></label>
                            <input type="text" value="${escapeHtml(lead.customerName)}" readonly class="form-control-readonly">
                        </div>
                        <div class="form-group">
                            <label>Project Name <span class="required">*</span></label>
                            <input type="text" value="${escapeHtml(lead.projectName)}" readonly class="form-control-readonly">
                        </div>
                    </div>
                    <div class="form-grid-3" style="margin-top: 1vw;">
                        <div class="form-group">
                            <label>Project Category <span class="required">*</span></label>
                            <input type="text" value="${escapeHtml(lead.projectCategory)}" readonly class="form-control-readonly">
                        </div>
                    </div>
                </div>
                
                <!-- Documents Section -->
                <div class="project-budget-section">
                    <div class="section-header">
                        <img src="/FISTO_FINANCE/assets/images/cashB_icon.webp" alt="">
                        <h4>Documents</h4>
                    </div>
                    <div class="form-flex-2">
                        <!-- Purchase Order -->
                        <div class="form-group">
                            <label>Purchase Order (PO) <span class="required">*</span></label>
                            <div class="file-upload-wrapper">
                                ${!isViewMode ? `
                                <button type="button" class="file-upload-btn" onclick="document.getElementById('poFile').click()" ${disabled}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    Upload File
                                </button>
                                <input type="file" id="poFile" style="display: none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onchange="handleFileUpload(this, 'po')">
                                ` : ''}
                                <div class="file-display" id="poFileDisplay">
                                    ${renderDocumentDisplay(documents.filter(d => d.type === 'po'), isViewMode)}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Invoice -->
                        <div class="form-group">
                            <label>Invoice <span class="required">*</span></label>
                            <div class="file-upload-wrapper">
                                ${!isViewMode ? `
                                <button type="button" class="file-upload-btn" onclick="document.getElementById('invoiceFile').click()" ${disabled}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    Upload Invoice
                                </button>
                                <input type="file" id="invoiceFile" style="display: none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onchange="handleFileUpload(this, 'invoice')">
                                ` : ''}
                                <div class="file-display" id="invoiceFileDisplay">
                                    ${renderDocumentDisplay(documents.filter(d => d.type === 'invoice'), isViewMode)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Budget Section -->
                <div class="project-budget-section">
                    <div class="section-header">
                        <img src="/FISTO_FINANCE/assets/images/salaryB_icon.webp" alt="">
                        <h4>Budget</h4>
                    </div>
                    <div class="form-grid-3">
                        <div class="form-group">
                            <label>Total Budget <span class="required">*</span></label>
                            <input type="number" id="totalBudget" 
                                   value="${budget ? budget.totalBudget : ''}" 
                                   placeholder="₹ 80000" 
                                   ${readonly}
                                   onchange="updateAllBalances(); calculatePerDayAmount()">
                        </div>
                        <div class="form-group">
                            <label>Starting Date <span class="required">*</span></label>
                            <input type="date" id="startingDate" 
                                   value="${budget ? budget.startingDate : ''}" 
                                   ${readonly}
                                   onchange="calculatePerDayAmount()">
                        </div>
                        <div class="form-group">
                            <label>Complication Date <span class="required">*</span></label>
                            <input type="date" id="complicationDate" 
                                   value="${budget ? budget.complicationDate : ''}" 
                                   ${readonly}
                                   onchange="calculatePerDayAmount()">
                        </div>
                    </div>
                    
                    <!-- Per Day Amount Display -->
                    <div class="per-day-amount-display" id="perDayAmountDisplay" style="margin-top: 1vw; display: none;">
                        <div class="per-day-card">
                            <div class="per-day-label">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.2vw; height: 1.2vw; margin-right: 0.5vw;">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Per Day Amount
                            </div>
                            <div class="per-day-value" id="perDayAmountValue">₹0.00</div>
                            <div class="per-day-info" id="perDayInfo">0 days</div>
                        </div>
                    </div>
                </div>
                
                <!-- Payment Section -->
                <div class="project-budget-section">
                    <div class="section-header">
                        <img src="/FISTO_FINANCE/assets/images/salaryB_icon.webp" alt="">
                        <h4>Payment</h4>
                    </div>
                    <div class="payment-table-container">
                        <table class="payment-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Payment Mode</th>
                                    <th>Percentage</th>
                                    <th>Received Amount</th>
                                    <th>Balance Amount</th>
                                    ${!isViewMode ? '<th style="width: 3vw;"></th>' : ''}
                                </tr>
                            </thead>
                            <tbody id="paymentTableBody">
                                ${renderPaymentRows(currentPayments, isViewMode)}
                            </tbody>
                        </table>
                    </div>
                    ${!isViewMode ? `
                    <div class="payment-add-btn-wrapper">
                        <button type="button" class="payment-add-btn" onclick="addPaymentRow()">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Footer -->
            ${!isViewMode ? `
            <div class="project-budget-modal-footer">
                <button type="button" class="submit-btn" onclick="submitProjectBudget()">
                    SUBMIT
                </button>
            </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize first empty row if no payments exist
    if (!isViewMode && currentPayments.length === 0) {
        addPaymentRow();
    }
    
    // Calculate per day amount if budget data exists
    if (budget && budget.totalBudget && budget.startingDate && budget.complicationDate) {
        setTimeout(() => calculatePerDayAmount(), 100);
    }
}


// ==================== DOCUMENT FUNCTIONS ====================

// View document in new tab or modal
function viewDocument(filePath, fileName) {
  const fileExt = fileName.split(".").pop().toLowerCase();

  // For images, show in modal
  if (["jpg", "jpeg", "png", "gif"].includes(fileExt)) {
    showImageModal(filePath, fileName);
  }
  // For PDFs and other documents, open in new tab
  else {
    window.open(filePath, "_blank");
  }
}

// Download document
function downloadDocument(filePath, fileName) {
  const link = document.createElement("a");
  link.href = filePath;
  link.download = fileName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Show image in modal
function showImageModal(imagePath, imageName) {
  // Remove existing modal if any
  const existingModal = document.getElementById("imageViewerModal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "imageViewerModal";
  modal.className = "image-viewer-modal";
  modal.innerHTML = `
        <div class="image-viewer-content">
            <div class="image-viewer-header">
                <h4>${escapeHtml(imageName)}</h4>
                <button class="modal-close-btn" onclick="closeImageModal()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="image-viewer-body">
                <img src="${imagePath}" alt="${escapeHtml(imageName)}">
            </div>
            <div class="image-viewer-footer">
                <button class="btn btn-primary" onclick="downloadDocument('${imagePath}', '${escapeHtml(
    imageName
  )}')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("active"), 10);

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeImageModal();
    }
  });
}

// Close image modal
function closeImageModal() {
  const modal = document.getElementById("imageViewerModal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  }
}

// Calculate per day amount
// Calculate per day amount
function calculatePerDayAmount() {
    const totalBudgetInput = document.getElementById('totalBudget');
    const startingDateInput = document.getElementById('startingDate');
    const complicationDateInput = document.getElementById('complicationDate');
    const display = document.getElementById('perDayAmountDisplay');
    const valueElement = document.getElementById('perDayAmountValue');
    const infoElement = document.getElementById('perDayInfo');
    
    // Check if all elements exist
    if (!totalBudgetInput || !startingDateInput || !complicationDateInput || !display || !valueElement || !infoElement) {
        console.log('Required elements not found');
        return;
    }
    
    const totalBudget = parseFloat(totalBudgetInput.value) || 0;
    const startingDate = startingDateInput.value;
    const complicationDate = complicationDateInput.value;
    
    // Check if all required fields are filled
    if (totalBudget > 0 && startingDate && complicationDate) {
        const start = new Date(startingDate);
        const end = new Date(complicationDate);
        
        // Calculate difference in days
        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end date
        
        console.log('Start:', startingDate, 'End:', complicationDate, 'Days:', daysDiff);
        
        if (daysDiff > 0) {
            const perDayAmount = totalBudget / daysDiff;
            
            // Show the display
            display.style.display = 'block';
            valueElement.textContent = `₹${formatNumber(perDayAmount)}`;
            infoElement.textContent = `Total ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'}`;
        } else {
            // If end date is before start date
            display.style.display = 'block';
            valueElement.textContent = '₹0.00';
            infoElement.textContent = 'Invalid date range';
            infoElement.style.color = '#EF4444';
        }
    } else {
        // Hide if fields are not complete
        display.style.display = 'none';
    }
}



// Render document display
function renderDocumentDisplay(docs, isViewMode) {
  if (docs.length === 0) {
    return "";
  }

  return docs
    .map(
      (doc) => `
        <div class="file-display-item document-blue">
            <div class="file-display-item-content">
                <div class="file-display-item-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <div class="file-display-item-name">${escapeHtml(
                  doc.fileName
                )}</div>
            </div>
            <div class="file-display-actions">
                <button type="button" class="file-action-btn view-btn" onclick="viewDocument('${
                  doc.filePath
                }', '${escapeHtml(doc.fileName)}')" title="View">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
                <button type="button" class="file-action-btn download-btn" onclick="downloadDocument('${
                  doc.filePath
                }', '${escapeHtml(doc.fileName)}')" title="Download">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </button>
                ${
                  !isViewMode
                    ? `
                <button type="button" class="file-action-btn delete-btn" onclick="removeDocument(${doc.id}, '${doc.type}')" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
                `
                    : ""
                }
            </div>
        </div>
    `
    )
    .join("");
}

// Render payment rows
function renderPaymentRows(payments, isViewMode) {
  if (payments.length === 0 && isViewMode) {
    return `
            <tr>
                <td colspan="5" style="text-align: center; padding: 1.5vw; color: #9CA3AF;">
                    No payment rows added. Click "+ Add" to add payment details.
                </td>
            </tr>
        `;
  }

  return payments
    .map(
      (payment, index) => `
        <tr class='budget-existing-payment' data-payment-index="${index}" ${
        payment.id ? `data-payment-id="${payment.id}"` : ""
      }>
            <td>
                <input type="date" 
                       class="payment-input" 
                       value="${payment.date || ""}" 
                       ${isViewMode ? "readonly" : ""}
                       data-field="date">
            </td>
            <td>
                <select class="payment-select" 
                        ${isViewMode ? "disabled" : ""}
                        data-field="paymentMode">
                    <option value="Cash" ${
                      payment.paymentMode === "Cash" ? "selected" : ""
                    }>Cash</option>
                    <option value="Account" ${
                      payment.paymentMode === "Account" ? "selected" : ""
                    }>Account</option>
                </select>
            </td>
            <td>
                <input type="number" 
                       class="payment-input" 
                       value="${payment.percentage || ""}" 
                       placeholder="15"
                       ${isViewMode ? "readonly" : ""}
                       data-field="percentage"
                       onchange="calculateFromPercentage(this)">
            </td>
            <td>
                <input type="number" 
                       class="payment-input" 
                       value="${payment.receivedAmount || ""}" 
                       placeholder="2250.00"
                       ${isViewMode ? "readonly" : ""}
                       data-field="receivedAmount"
                       onchange="calculateFromAmount(this)">
            </td>
            <td>
                <input type="number" 
                       class="payment-input" 
                       value="${payment.balanceAmount || ""}" 
                       placeholder="12750.00"
                       readonly
                       data-field="balanceAmount">
            </td>
            ${
              !isViewMode
                ? `
            <td>
                <button type="button" class="file-remove-btn" onclick="removePaymentRow(${index})">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </td>
            `
                : ""
            }
        </tr>
    `
    )
    .join("");
}

// ==================== PAYMENT FUNCTIONS ====================

// Add payment row
function addPaymentRow() {
  const tbody = document.getElementById("paymentTableBody");
  if (!tbody) return;

  // Remove "no payments" message if exists
  const noDataRow = tbody.querySelector("td[colspan]");
  if (noDataRow) {
    noDataRow.closest("tr").remove();
  }

  const newIndex = currentPayments.length;
  currentPayments.push({
    date: "",
    paymentMode: "Cash",
    percentage: "",
    receivedAmount: "",
    balanceAmount: "",
  });

  const newRow = document.createElement("tr");
  newRow.setAttribute("data-payment-index", newIndex);
  newRow.innerHTML = `
        <td>
            <input type="date" class="payment-input" data-field="date">
        </td>
        <td>
            <select class="payment-select" data-field="paymentMode">
                <option value="Cash">Cash</option>
                <option value="Account">Account</option>
            </select>
        </td>
        <td>
            <input type="number" class="payment-input" placeholder="15" 
                   data-field="percentage" onchange="calculateFromPercentage(this)">
        </td>
        <td>
            <input type="number" class="payment-input" placeholder="2250.00" 
                   data-field="receivedAmount" onchange="calculateFromAmount(this)">
        </td>
        <td>
            <input type="number" class="payment-input" placeholder="12750.00" 
                   readonly data-field="balanceAmount">
        </td>
        <td>
            <button type="button" class="file-remove-btn" onclick="removePaymentRow(${newIndex})">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </td>
    `;

  tbody.appendChild(newRow);
}

// Remove payment row
async function removePaymentRow(index) {
  const row = document.querySelector(`tr[data-payment-index="${index}"]`);
  if (!row) return;

  const paymentId = row.getAttribute("data-payment-id");

  // If payment exists in database, delete it
  if (paymentId) {
    const confirmed = confirm("Are you sure you want to delete this payment?");
    if (!confirmed) return;

    const deleted = await deletePayment(parseInt(paymentId));
    if (!deleted) return;
  }

  // Remove from array and DOM
  currentPayments.splice(index, 1);
  row.remove();

  // Reindex remaining rows
  document.querySelectorAll("#paymentTableBody tr").forEach((tr, idx) => {
    tr.setAttribute("data-payment-index", idx);
    const removeBtn = tr.querySelector(".file-remove-btn");
    if (removeBtn) {
      removeBtn.setAttribute("onclick", `removePaymentRow(${idx})`);
    }
  });

  // Update all balance amounts
  updateAllBalances();
}

// Calculate from percentage
function calculateFromPercentage(input) {
  const row = input.closest("tr");
  const totalBudget =
    parseFloat(document.getElementById("totalBudget").value) || 0;
  const percentage = parseFloat(input.value) || 0;

  if (totalBudget > 0 && percentage > 0) {
    const receivedAmount = (totalBudget * percentage) / 100;
    const receivedInput = row.querySelector('[data-field="receivedAmount"]');
    receivedInput.value = receivedAmount.toFixed(2);

    updateBalanceAmount(row);
  }
}

// Calculate from amount
function calculateFromAmount(input) {
  const row = input.closest("tr");
  const totalBudget =
    parseFloat(document.getElementById("totalBudget").value) || 0;
  const receivedAmount = parseFloat(input.value) || 0;

  if (totalBudget > 0 && receivedAmount > 0) {
    const percentage = (receivedAmount / totalBudget) * 100;
    const percentageInput = row.querySelector('[data-field="percentage"]');
    percentageInput.value = percentage.toFixed(2);

    updateBalanceAmount(row);
  }
}

// Update balance amount for a row
function updateBalanceAmount(row) {
  const totalBudget =
    parseFloat(document.getElementById("totalBudget").value) || 0;
  const receivedAmount =
    parseFloat(row.querySelector('[data-field="receivedAmount"]').value) || 0;

  // Calculate total received up to this row
  const allRows = document.querySelectorAll("#paymentTableBody tr");
  const currentIndex = Array.from(allRows).indexOf(row);
  let totalReceived = 0;

  for (let i = 0; i <= currentIndex; i++) {
    const rowReceivedInput = allRows[i].querySelector(
      '[data-field="receivedAmount"]'
    );
    if (rowReceivedInput) {
      totalReceived += parseFloat(rowReceivedInput.value) || 0;
    }
  }

  const balanceAmount = totalBudget - totalReceived;
  const balanceInput = row.querySelector('[data-field="balanceAmount"]');
  balanceInput.value = balanceAmount.toFixed(2);
}

// Update all balance amounts
function updateAllBalances() {
  const rows = document.querySelectorAll("#paymentTableBody tr");
  rows.forEach((row) => {
    updateBalanceAmount(row);
  });
}

// ==================== FILE HANDLING ====================

// Handle file upload
async function handleFileUpload(input, documentType) {
  const file = input.files[0];
  if (!file) return;

  // Validate file size (10MB)
  if (file.size > 10485760) {
    showError("File size must be less than 10MB");
    input.value = "";
    return;
  }

  // Upload file
  const result = await uploadDocument(currentLeadId, file, documentType);

  if (result) {
    // Add to documents array
    currentDocuments.push({
      id: result.id,
      type: documentType,
      fileName: result.fileName,
      filePath: result.filePath,
      fileSize: result.fileSize,
    });

    // Update display
    const displayId =
      documentType === "po" ? "poFileDisplay" : "invoiceFileDisplay";
    const display = document.getElementById(displayId);
    if (display) {
      display.innerHTML = renderDocumentDisplay(
        currentDocuments.filter((d) => d.type === documentType),
        false
      );
    }
  }

  // Clear input
  input.value = "";
}

// Remove document
async function removeDocument(docId, documentType) {
  const confirmed = confirm("Are you sure you want to delete this document?");
  if (!confirmed) return;

  const deleted = await deleteDocument(docId);

  if (deleted) {
    // Remove from array
    currentDocuments = currentDocuments.filter((d) => d.id !== docId);

    // Update display
    const displayId =
      documentType === "po" ? "poFileDisplay" : "invoiceFileDisplay";
    const display = document.getElementById(displayId);
    if (display) {
      display.innerHTML = renderDocumentDisplay(
        currentDocuments.filter((d) => d.type === documentType),
        false
      );
    }
  }
}

// ==================== SUBMIT FUNCTION ====================

async function submitProjectBudget() {
  // Validate total budget
  const totalBudget = document.getElementById("totalBudget").value;
  const startingDate = document.getElementById("startingDate").value;
  const complicationDate = document.getElementById("complicationDate").value;

  if (!totalBudget || !startingDate || !complicationDate) {
    showError("Please fill in all required budget fields");
    return;
  }

  // Save budget data
  const budgetSaved = await saveProjectBudget(currentLeadId, {
    total_budget: parseFloat(totalBudget),
    starting_date: startingDate,
    complication_date: complicationDate,
  });

  if (!budgetSaved) return;

  // Save all payment rows
  const rows = document.querySelectorAll("#paymentTableBody tr");
  for (const row of rows) {
    const date = row.querySelector('[data-field="date"]').value;
    const paymentMode = row.querySelector('[data-field="paymentMode"]').value;
    const percentage = row.querySelector('[data-field="percentage"]').value;
    const receivedAmount = row.querySelector(
      '[data-field="receivedAmount"]'
    ).value;
    const balanceAmount = row.querySelector(
      '[data-field="balanceAmount"]'
    ).value;

    // Skip if row is empty
    if (!date && !percentage && !receivedAmount) continue;

    // Validate required fields
    if (!date || !paymentMode || !percentage || !receivedAmount) {
      showError("Please fill in all payment fields");
      return;
    }

    // Check if this payment already exists (has ID)
    const paymentId = row.getAttribute("data-payment-id");
    if (!paymentId) {
      // Add new payment
      await addPayment({
        lead_id: currentLeadId,
        payment_date: date,
        payment_mode: paymentMode,
        percentage: parseFloat(percentage),
        received_amount: parseFloat(receivedAmount),
        balance_amount: parseFloat(balanceAmount),
      });
    }
  }

  showSuccess("Project budget saved successfully!");
  closeProjectModal();
  loadLeads();
}

// ==================== UTILITY FUNCTIONS ====================

// Close project modal
function closeProjectModal() {
  const modal = document.querySelector(".project-budget-modal-overlay");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  }
  currentLeadId = null;
  currentPayments = [];
  currentDocuments = [];
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// Show loader
function showLoader() {
  let loader = document.getElementById("globalLoader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "globalLoader";
    loader.className = "loader-overlay";
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
  }
  loader.style.display = "flex";
}

// Hide loader
function hideLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) {
    loader.style.display = "none";
  }
}

// Show success message
function showSuccess(message) {
  showToast(message, "success");
}

// Show error message
function showError(message) {
  showToast(message, "error");
}

// Show toast notification
function showToast(message, type = "info") {
  // Remove existing toasts
  document.querySelectorAll(".toast-notification").forEach((t) => t.remove());

  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${
              type === "success" ? "check-circle" : "exclamation-circle"
            }"></i>
            <span>${message}</span>
        </div>
    `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// ==================== INITIALIZE ON DOM READY ====================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeProjectBudget);
} else {
  initializeProjectBudget();
}
