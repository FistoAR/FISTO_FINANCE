/* ===================================
   PROJECT BUDGET - Complete System with Fake Data
   With File Upload & Payment Tracking
   =================================== */

// ===================================
// FAKE DATA
// ===================================

let projectBudgets = [
  {
    id: 1,
    companyName: 'FIST-O Pvt Lmt',
    customerName: 'Sameer',
    projectName: 'Financial Project',
    projectCategory: 'Website'
  },
  {
    id: 2,
    companyName: 'FIST-O Pvt Lmt',
    customerName: 'Sameer',
    projectName: 'Financial Project',
    projectCategory: 'Website'
  },
  {
    id: 3,
    companyName: 'FIST-O Pvt Lmt',
    customerName: 'Sameer',
    projectName: 'Financial Project',
    projectCategory: 'Website'
  },
  {
    id: 4,
    companyName: 'FIST-O Pvt Lmt',
    customerName: 'Sameer',
    projectName: 'Financial Project',
    projectCategory: 'Website'
  },
  {
    id: 5,
    companyName: 'FIST-O Pvt Lmt',
    customerName: 'Sameer',
    projectName: 'Financial Project',
    projectCategory: 'Website'
  },
  {
    id: 6,
    companyName: 'FIST-O Pvt Lmt',
    customerName: 'Sameer',
    projectName: 'Financial Project',
    projectCategory: 'Website'
  }
];

// Global state
let currentProjectBudget = null;
let editingBudgetIndex = null;
let uploadedPO = null;
let uploadedInvoice = null;
let paymentRows = [];

// ===================================
// INITIALIZE & RENDER TABLE
// ===================================

document.addEventListener('DOMContentLoaded', function() {
  renderProjectBudgetTable();
  console.log('✅ Project Budget functionality loaded with fake data');
});

// ===================================
// RENDER MAIN TABLE
// ===================================

function renderProjectBudgetTable() {
  const tbody = document.getElementById('projectBudgetTableBody');
  
  if (!tbody) return;
  
  if (projectBudgets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem; color: #64748b;">
          No project budgets available.
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = projectBudgets.map((budget, index) => `
    <tr>
      <td>${String(index + 1).padStart(2, '0')}</td>
      <td>${budget.companyName}</td>
      <td>${budget.customerName}</td>
      <td>${budget.projectName}</td>
      <td>${budget.projectCategory}</td>
      <td style="text-align: center;">
        <button class="project-budget-add-btn" onclick="openAddProjectBudgetModal(${index})">
          + Add
        </button>
      </td>
      <td style="text-align: center;">
        <button class="project-budget-view-btn" onclick="openViewProjectBudget(${index})">
          <img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon">
        </button>
      </td>
      <td style="text-align: center;">
        <button class="project-budget-delete-btn" onclick="deleteProjectBudget(${index})">
          <img src="/FISTO_FINANCE/assets/images/tabler_delete_icon.webp" alt="delete icon">
        </button>
      </td>
    </tr>
  `).join('');
}

// ===================================
// MODAL FUNCTIONS
// ===================================

function openAddProjectBudgetModal(index) {
  editingBudgetIndex = index;
  currentProjectBudget = projectBudgets[index];
  
  // Pre-populate with project data
  document.getElementById('budgetCompanyName').value = currentProjectBudget.companyName;
  document.getElementById('budgetCustomerName').value = currentProjectBudget.customerName;
  document.getElementById('budgetProjectName').value = currentProjectBudget.projectName;
  document.getElementById('budgetProjectCategory').value = currentProjectBudget.projectCategory;
  
  // Clear other fields
  document.getElementById('budgetTotalBudget').value = '';
  document.getElementById('budgetStartingDate').value = '';
  document.getElementById('budgetComplicationDate').value = '';
  
  uploadedPO = null;
  uploadedInvoice = null;
  paymentRows = [];
  
  document.getElementById('poFileDisplay').innerHTML = '';
  document.getElementById('invoiceFileDisplay').innerHTML = '';
  renderPaymentTable();
  
  document.getElementById('projectBudgetModal').classList.add('active');
  document.getElementById('projectBudgetModal').style.display = 'flex';
}

function closeProjectBudgetModal() {
  document.getElementById('projectBudgetModal').classList.remove('active');
  document.getElementById('projectBudgetModal').style.display = 'none';
  resetProjectBudgetForm();
}

function closeProjectBudgetModalOnOverlay(event) {
  if (event.target === event.currentTarget) {
    closeProjectBudgetModal();
  }
}

function resetProjectBudgetForm() {
  document.getElementById('projectBudgetForm').reset();
  uploadedPO = null;
  uploadedInvoice = null;
  paymentRows = [];
  
  document.getElementById('poFileDisplay').innerHTML = '';
  document.getElementById('invoiceFileDisplay').innerHTML = '';
  renderPaymentTable();
}

// ===================================
// FILE UPLOAD HANDLING
// ===================================

function handlePOUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      CommonModal.error('Please upload a valid document (PDF, DOC, DOCX)', 'Invalid File Type');
      event.target.value = '';
      return;
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      CommonModal.error('File size must be less than 10MB', 'File Too Large');
      event.target.value = '';
      return;
    }
    
    uploadedPO = file;
    displayUploadedFile('poFileDisplay', file, 'Purchase Order');
  }
}

function handleInvoiceUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      CommonModal.error('Please upload a valid document (PDF, DOC, DOCX)', 'Invalid File Type');
      event.target.value = '';
      return;
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      CommonModal.error('File size must be less than 10MB', 'File Too Large');
      event.target.value = '';
      return;
    }
    
    uploadedInvoice = file;
    displayUploadedFile('invoiceFileDisplay', file, 'Invoice');
  }
}

function displayUploadedFile(containerId, file, label) {
  const container = document.getElementById(containerId);
  const icon = file.type === 'application/pdf' ? '📄' : '📃';
  
  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f0f7ff; border-radius: 8px; border: 1px solid #2D6BFF;">
      <span style="font-size: 1.5rem;">${icon}</span>
      <div style="flex: 1;">
        <div style="font-weight: 600; color: #1e293b; font-size: 0.875rem;">${label}</div>
        <div style="font-size: 0.75rem; color: #64748b;">${file.name}</div>
      </div>
      <button type="button" onclick="removeUploadedFile('${containerId}')" style="background: #fee2e2; color: #dc2626; border: none; padding: 0.25rem 0.5rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">Remove</button>
    </div>
  `;
}

function removeUploadedFile(containerId) {
  if (containerId === 'poFileDisplay') {
    uploadedPO = null;
    document.getElementById('budgetPOUpload').value = '';
  } else {
    uploadedInvoice = null;
    document.getElementById('budgetInvoiceUpload').value = '';
  }
  document.getElementById(containerId).innerHTML = '';
}

// ===================================
// PAYMENT TABLE MANAGEMENT
// ===================================

function addPaymentRow() {
  const totalBudget = parseFloat(document.getElementById('budgetTotalBudget').value) || 0;
  
  if (totalBudget === 0) {
    CommonModal.error('Please enter total budget before adding payment rows', 'Validation Error');
    return;
  }
  
  const totalAllocated = paymentRows.reduce((sum, row) => sum + (parseFloat(row.receivedAmount) || 0), 0);
  
  if (totalAllocated >= totalBudget) {
    CommonModal.error('Total received amount already equals or exceeds total budget', 'Budget Limit Reached');
    return;
  }
  
  const newRow = {
    id: Date.now(),
    date: getTodayDate(),
    paymentMode: 'Cash',
    percentage: '',
    receivedAmount: '',
    balanceAmount: totalBudget - totalAllocated
  };
  
  paymentRows.push(newRow);
  renderPaymentTable();
}

function removePaymentRow(rowId) {
  paymentRows = paymentRows.filter(row => row.id !== rowId);
  renderPaymentTable();
  updateAllBalanceAmounts();
}

function renderPaymentTable() {
  const tbody = document.getElementById('paymentTableBody');
  
  if (paymentRows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 1rem; color: #64748b;">
          No payment rows added. Click "+ Add" to add payment details.
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = paymentRows.map((row, index) => `
    <tr>
      <td>
        <input 
          type="date" 
          class="payment-input" 
          value="${row.date}"
          onchange="updatePaymentRow(${row.id}, 'date', this.value)"
        />
      </td>
      <td>
        <select 
          class="payment-input payment-select"
          onchange="updatePaymentRow(${row.id}, 'paymentMode', this.value)"
        >
          <option value="Cash" ${row.paymentMode === 'Cash' ? 'selected' : ''}>Cash</option>
          <option value="Account" ${row.paymentMode === 'Account' ? 'selected' : ''}>Account</option>
        </select>
      </td>
      <td>
        <input 
          type="number" 
          class="payment-input" 
          placeholder="30"
          min="0"
          max="100"
          value="${row.percentage}"
          onchange="updatePaymentRow(${row.id}, 'percentage', this.value)"
        />
      </td>
      <td>
        <input 
          type="number" 
          class="payment-input" 
          placeholder="₹ 8,000"
          min="0"
          value="${row.receivedAmount}"
          onchange="updatePaymentRow(${row.id}, 'receivedAmount', this.value)"
        />
      </td>
      <td>
        <input 
          type="number" 
          class="payment-input" 
          placeholder="₹ 8,000"
          value="${row.balanceAmount}"
          readonly
          style="background: #f8fafc; cursor: not-allowed;"
        />
      </td>
    </tr>
  `).join('');
}

function updatePaymentRow(rowId, field, value) {
  const row = paymentRows.find(r => r.id === rowId);
  if (!row) return;
  
  row[field] = value;
  
  const totalBudget = parseFloat(document.getElementById('budgetTotalBudget').value) || 0;
  
  if (field === 'percentage') {
    const percentage = parseFloat(value) || 0;
    if (percentage > 100) {
      CommonModal.error('Percentage cannot exceed 100%', 'Invalid Percentage');
      row.percentage = 100;
      renderPaymentTable();
      return;
    }
    row.receivedAmount = (totalBudget * percentage / 100).toFixed(2);
  } else if (field === 'receivedAmount') {
    const received = parseFloat(value) || 0;
    if (received > totalBudget) {
      CommonModal.error('Received amount cannot exceed total budget', 'Invalid Amount');
      row.receivedAmount = totalBudget;
      renderPaymentTable();
      return;
    }
    row.percentage = ((received / totalBudget) * 100).toFixed(2);
  }
  
  updateAllBalanceAmounts();
  renderPaymentTable();
}

function updateAllBalanceAmounts() {
  const totalBudget = parseFloat(document.getElementById('budgetTotalBudget').value) || 0;
  let cumulativeReceived = 0;
  
  paymentRows.forEach(row => {
    cumulativeReceived += parseFloat(row.receivedAmount) || 0;
    row.balanceAmount = (totalBudget - cumulativeReceived).toFixed(2);
  });
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ===================================
// SUBMIT PROJECT BUDGET
// ===================================

function submitProjectBudget() {
  const companyName = document.getElementById('budgetCompanyName').value;
  const customerName = document.getElementById('budgetCustomerName').value;
  const projectName = document.getElementById('budgetProjectName').value;
  const projectCategory = document.getElementById('budgetProjectCategory').value;
  const totalBudget = document.getElementById('budgetTotalBudget').value;
  const startingDate = document.getElementById('budgetStartingDate').value;
  const complicationDate = document.getElementById('budgetComplicationDate').value;
  
  if (!companyName || companyName.trim().length < 2) {
    CommonModal.error('Please enter a valid company name', 'Validation Error');
    return;
  }
  
  if (!customerName || customerName.trim().length < 2) {
    CommonModal.error('Please enter a valid customer name', 'Validation Error');
    return;
  }
  
  if (!projectName || projectName.trim().length < 3) {
    CommonModal.error('Please enter a valid project name', 'Validation Error');
    return;
  }
  
  if (!projectCategory) {
    CommonModal.error('Please select a project category', 'Validation Error');
    return;
  }
  
  if (!uploadedPO) {
    CommonModal.error('Please upload Purchase Order document', 'Validation Error');
    return;
  }
  
  if (!uploadedInvoice) {
    CommonModal.error('Please upload Invoice document', 'Validation Error');
    return;
  }
  
  if (!totalBudget || parseFloat(totalBudget) <= 0) {
    CommonModal.error('Please enter a valid total budget', 'Validation Error');
    return;
  }
  
  if (!startingDate) {
    CommonModal.error('Please select starting date', 'Validation Error');
    return;
  }
  
  if (!complicationDate) {
    CommonModal.error('Please select completion date', 'Validation Error');
    return;
  }
  
  const start = new Date(startingDate);
  const end = new Date(complicationDate);
  
  if (end <= start) {
    CommonModal.error('Completion date must be after starting date', 'Invalid Date');
    return;
  }
  
  if (paymentRows.length === 0) {
    CommonModal.error('Please add at least one payment row', 'Validation Error');
    return;
  }
  
  for (let row of paymentRows) {
    if (!row.receivedAmount || parseFloat(row.receivedAmount) <= 0) {
      CommonModal.error('All payment rows must have a received amount', 'Validation Error');
      return;
    }
  }
  
  CommonModal.success(`Project budget for "${projectName}" saved successfully!`);
  closeProjectBudgetModal();
}

// ===================================
// VIEW / DELETE PROJECT BUDGET
// ===================================

function openViewProjectBudget(index) {
  // Same as openAddProjectBudgetModal for now
  openAddProjectBudgetModal(index);
}

function deleteProjectBudget(index) {
  const budget = projectBudgets[index];
  
  CommonModal.confirm(
    `Are you sure you want to delete the budget for "${budget.projectName}"? This action cannot be undone.`,
    'Delete Project Budget',
    function() {
      projectBudgets.splice(index, 1);
      renderProjectBudgetTable();
      CommonModal.success('Project budget deleted successfully!');
    }
  );
}

// ===================================
// GLOBAL FUNCTIONS
// ===================================

window.openAddProjectBudgetModal = openAddProjectBudgetModal;
window.closeProjectBudgetModal = closeProjectBudgetModal;
window.closeProjectBudgetModalOnOverlay = closeProjectBudgetModalOnOverlay;
window.handlePOUpload = handlePOUpload;
window.handleInvoiceUpload = handleInvoiceUpload;
window.removeUploadedFile = removeUploadedFile;
window.addPaymentRow = addPaymentRow;
window.removePaymentRow = removePaymentRow;
window.updatePaymentRow = updatePaymentRow;
window.submitProjectBudget = submitProjectBudget;
window.openViewProjectBudget = openViewProjectBudget;
window.deleteProjectBudget = deleteProjectBudget;
