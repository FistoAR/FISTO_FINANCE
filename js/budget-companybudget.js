// ===================================
// COMPANY BUDGET - COMPLETE JAVASCRIPT
// All fields editable including Balance
// ===================================

let companyBudgetRows = [];

// ===================================
// INITIALIZE ON PAGE LOAD
// ===================================

document.addEventListener('DOMContentLoaded', function() {
  const companyBudgetTab = document.getElementById('company-budget');
  if (companyBudgetTab) {
    initializeCompanyBudget();
  }
});

// ===================================
// INITIALIZE
// ===================================

function initializeCompanyBudget() {
  renderCompanyBudgetTable();
}

// ===================================
// ADD NEW ROW
// ===================================

function addCompanyBudgetRow() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const newRow = {
    date: today,
    paymentReason: '',
    paymentMode: 'Cash',
    credit: '',
    debit: '',
    balance: '',
    givenMember: '',
    receiveMember: '',
    remarks: ''
  };
  
  companyBudgetRows.push(newRow);
  renderCompanyBudgetTable();
  
  // Auto-focus on the first input of the new row
  setTimeout(() => {
    const lastRow = document.querySelector('#companyBudgetTableBody tr:last-child');
    if (lastRow) {
      const firstInput = lastRow.querySelector('input[type="date"]');
      if (firstInput) firstInput.focus();
    }
  }, 100);
}

// ===================================
// RENDER TABLE
// ===================================

function renderCompanyBudgetTable() {
  const tbody = document.getElementById('companyBudgetTableBody');
  
  // Show empty state if no rows
  if (companyBudgetRows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="padding: 0; border: none;">
          <div class="company-budget-empty">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3>No Records Yet</h3>
            <p>Click the "Add" button to create your first company budget entry</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  // Render all rows
  let html = '';
  companyBudgetRows.forEach((row, index) => {
    html += `
      <tr>
        <!-- Date -->
        <td>
          <input 
            type="date" 
            class="company-budget-date" 
            value="${row.date}"
            onchange="updateCompanyBudgetRow(${index}, 'date', this.value)"
          >
        </td>
        
        <!-- Payment Reason -->
        <td>
          <input 
            type="text" 
            class="company-budget-input" 
            value="${row.paymentReason}"
            placeholder="Reason For Payment"
            oninput="updateCompanyBudgetRow(${index}, 'paymentReason', this.value)"
          >
        </td>
        
        <!-- Payment Mode -->
        <td>
          <select 
            class="company-budget-select" 
            onchange="updateCompanyBudgetRow(${index}, 'paymentMode', this.value)"
          >
            <option value="Cash" ${row.paymentMode === 'Cash' ? 'selected' : ''}>Cash</option>
            <option value="Account" ${row.paymentMode === 'Account' ? 'selected' : ''}>Account</option>
          </select>
        </td>
        
        <!-- Credit (Green) - Fully Editable -->
        <td>
          <input 
            type="number" 
            class="company-budget-input credit" 
            value="${row.credit}"
            placeholder="₹ 0000"
            oninput="updateCompanyBudgetRow(${index}, 'credit', this.value)"
          >
        </td>
        
        <!-- Debit (Red) - Fully Editable -->
        <td>
          <input 
            type="number" 
            class="company-budget-input debit" 
            value="${row.debit}"
            placeholder="₹ 0000"
            oninput="updateCompanyBudgetRow(${index}, 'debit', this.value)"
          >
        </td>
        
        <!-- Balance (Blue) - Fully Editable -->
        <td>
          <input 
            type="number" 
            class="company-budget-input balance" 
            value="${row.balance}"
            placeholder="₹ 0000"
            oninput="updateCompanyBudgetRow(${index}, 'balance', this.value)"
          >
        </td>
        
        <!-- Given Member -->
        <td>
          <input 
            type="text" 
            class="company-budget-input" 
            value="${row.givenMember}"
            placeholder="Prakash"
            oninput="updateCompanyBudgetRow(${index}, 'givenMember', this.value)"
          >
        </td>
        
        <!-- Receive Member -->
        <td>
          <input 
            type="text" 
            class="company-budget-input" 
            value="${row.receiveMember}"
            placeholder="Sameer"
            oninput="updateCompanyBudgetRow(${index}, 'receiveMember', this.value)"
          >
        </td>
        
        <!-- Remarks -->
        <td>
          <input 
            type="text" 
            class="company-budget-input remarks" 
            value="${row.remarks}"
            placeholder="Enter Remarks"
            oninput="updateCompanyBudgetRow(${index}, 'remarks', this.value)"
          >
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

// ===================================
// UPDATE ROW DATA
// ===================================

function updateCompanyBudgetRow(index, field, value) {
  // Update the specific field
  companyBudgetRows[index][field] = value;
  
  // No auto-calculation - all fields are independent
  // User can manually enter any value including balance
}

// ===================================
// DELETE ROW (Optional - if you want delete functionality)
// ===================================

function deleteCompanyBudgetRow(index) {
  if (confirm('Are you sure you want to delete this row?')) {
    companyBudgetRows.splice(index, 1);
    renderCompanyBudgetTable();
  }
}

// ===================================
// SAVE COMPANY BUDGET DATA
// ===================================

function saveCompanyBudget() {
  if (companyBudgetRows.length === 0) {
    alert('No data to save. Please add at least one row.');
    return;
  }
  
  // Validate required fields
  for (let i = 0; i < companyBudgetRows.length; i++) {
    const row = companyBudgetRows[i];
    
    if (!row.date) {
      alert(`Row ${i + 1}: Date is required`);
      return;
    }
    
    if (!row.paymentReason) {
      alert(`Row ${i + 1}: Payment Reason is required`);
      return;
    }
  }
  
  // Prepare data for backend
  const dataToSave = {
    budgetData: companyBudgetRows,
    totalRecords: companyBudgetRows.length,
    lastUpdated: new Date().toISOString()
  };
  
  console.log('Company Budget Data to Save:', dataToSave);
  
  // Here you would send data to your backend API
  // Example:
  /*
  fetch('/api/company-budget/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataToSave)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    alert('Company budget saved successfully!');
  })
  .catch((error) => {
    console.error('Error:', error);
    alert('Error saving company budget');
  });
  */
  
  alert('Company budget data saved successfully!');
}

// ===================================
// CLEAR ALL DATA (Optional)
// ===================================

function clearCompanyBudget() {
  if (confirm('Are you sure you want to clear all company budget data? This cannot be undone.')) {
    companyBudgetRows = [];
    renderCompanyBudgetTable();
    alert('All company budget data has been cleared.');
  }
}

// ===================================
// EXPORT TO CSV (Optional - Bonus Feature)
// ===================================

function exportCompanyBudgetToCSV() {
  if (companyBudgetRows.length === 0) {
    alert('No data to export');
    return;
  }
  
  // Create CSV header
  const headers = ['Date', 'Payment Reason', 'Payment Mode', 'Credit', 'Debit', 'Balance', 'Given Member', 'Receive Member', 'Remarks'];
  
  // Create CSV rows
  const csvRows = [headers.join(',')];
  
  companyBudgetRows.forEach(row => {
    const rowData = [
      row.date,
      `"${row.paymentReason}"`,
      row.paymentMode,
      row.credit || 0,
      row.debit || 0,
      row.balance || 0,
      `"${row.givenMember}"`,
      `"${row.receiveMember}"`,
      `"${row.remarks}"`
    ];
    csvRows.push(rowData.join(','));
  });
  
  // Create CSV blob
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `company-budget-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ===================================
// GET TOTAL SUMMARY (Optional)
// ===================================

function getCompanyBudgetSummary() {
  let totalCredit = 0;
  let totalDebit = 0;
  let finalBalance = 0;
  
  companyBudgetRows.forEach(row => {
    totalCredit += parseFloat(row.credit) || 0;
    totalDebit += parseFloat(row.debit) || 0;
    finalBalance += parseFloat(row.balance) || 0;
  });
  
  return {
    totalRecords: companyBudgetRows.length,
    totalCredit: totalCredit,
    totalDebit: totalDebit,
    finalBalance: finalBalance
  };
}

// ===================================
// PRINT SUMMARY (Optional)
// ===================================

function printCompanyBudgetSummary() {
  const summary = getCompanyBudgetSummary();
  
  console.log('=== COMPANY BUDGET SUMMARY ===');
  console.log(`Total Records: ${summary.totalRecords}`);
  console.log(`Total Credit: ₹${summary.totalCredit.toFixed(2)}`);
  console.log(`Total Debit: ₹${summary.totalDebit.toFixed(2)}`);
  console.log(`Final Balance: ₹${summary.finalBalance.toFixed(2)}`);
  console.log('==============================');
  
  alert(`
    Company Budget Summary:
    
    Total Records: ${summary.totalRecords}
    Total Credit: ₹${summary.totalCredit.toFixed(2)}
    Total Debit: ₹${summary.totalDebit.toFixed(2)}
    Final Balance: ₹${summary.finalBalance.toFixed(2)}
  `);
}
