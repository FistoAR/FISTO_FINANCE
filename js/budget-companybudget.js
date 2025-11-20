// ===================================
// COMPANY BUDGET - COMPLETE JAVASCRIPT WITH BACKEND INTEGRATION
// ===================================

const COMPANY_BUDGET_API = {
    BASE_URL: 'https://www.fist-o.com/fisto_finance_app/api/budget/company/',
    CREATE: 'create.php',
    READ: 'read.php',
    UPDATE: 'update.php',
    DELETE: 'delete.php'
};

let companyBudgetRows = [];
let isLoading = false;

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

async function initializeCompanyBudget() {
    await fetchCompanyBudgetData();
}

// ===================================
// FETCH DATA FROM BACKEND
// ===================================

async function fetchCompanyBudgetData() {
    if (isLoading) return;
    
    isLoading = true;
    showLoadingState();

    try {
        const response = await fetch(COMPANY_BUDGET_API.BASE_URL + COMPANY_BUDGET_API.READ);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            companyBudgetRows = result.data.map(row => ({
                id: row.id,
                date: row.date,
                paymentReason: row.payment_reason,
                paymentMode: row.payment_mode,
                credit: row.credit || '',
                debit: row.debit || '',
                balance: row.balance || '',
                givenMember: row.given_member || '',
                receiveMember: row.receive_member || '',
                remarks: row.remarks || ''
            }));

            console.log('📊 Fetched company budget data:', result);
            renderCompanyBudgetTable();
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }

    } catch (error) {
        console.error('❌ Error fetching company budget data:', error);
        CommonModal.error('Failed to load company budget data: ' + error.message);
        renderCompanyBudgetTable(); // Show empty state
    } finally {
        isLoading = false;
    }
}

// ===================================
// SHOW LOADING STATE
// ===================================

function showLoadingState() {
    const tbody = document.getElementById('companyBudgetTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="10" style="padding: 3vw; text-align: center; border: none;">
                <div style="color: #2D6BFF;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    <p style="margin-top: 1vw; font-family: 'Gilroy-Medium', sans-serif;">Loading...</p>
                </div>
            </td>
        </tr>
    `;
}

// ===================================
// ADD NEW ROW (LOCAL ONLY - NOT SAVED YET)
// ===================================


function addCompanyBudgetRow() {
    const today = new Date().toISOString().split('T')[0];
    
    const newRow = {
        id: null, // Will be set after saving to backend
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
    
    // Add to the BEGINNING of the array instead of the end
    companyBudgetRows.unshift(newRow);
    renderCompanyBudgetTable();
    
    // Auto-focus on the first input of the new row (which is now at the top)
    setTimeout(() => {
        const firstRow = document.querySelector('#companyBudgetTableBody tr:first-child');
        if (firstRow) {
            const firstInput = firstRow.querySelector('input[type="date"]');
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
                <td colspan="10" style="padding: 0; border: none;">
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
                
                <!-- Credit -->
                <td>
                    <input 
                        type="number" 
                        class="company-budget-input credit" 
                        value="${row.credit}"
                        placeholder="₹ 0000"
                        oninput="updateCompanyBudgetRow(${index}, 'credit', this.value)"
                    >
                </td>
                
                <!-- Debit -->
                <td>
                    <input 
                        type="number" 
                        class="company-budget-input debit" 
                        value="${row.debit}"
                        placeholder="₹ 0000"
                        oninput="updateCompanyBudgetRow(${index}, 'debit', this.value)"
                    >
                </td>
                
                <!-- Balance -->
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
                        placeholder="Person name"
                        oninput="updateCompanyBudgetRow(${index}, 'givenMember', this.value)"
                    >
                </td>
                
                <!-- Receive Member -->
                <td>
                    <input 
                        type="text" 
                        class="company-budget-input" 
                        value="${row.receiveMember}"
                        placeholder="Person name"
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

                <!-- Actions (Delete) -->
                <td style="text-align: center;">
                    <button 
                        onclick="deleteCompanyBudgetRow(${index})"
                        style="background: #EF4444; color: white; border: none; padding: 0.4vw 0.8vw; border-radius: 0.3vw; cursor: pointer; font-family: 'Gilroy-SemiBold', sans-serif; font-size: 0.8vw;"
                        title="Delete this entry"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ===================================
// UPDATE ROW DATA (LOCAL)
// ===================================

function updateCompanyBudgetRow(index, field, value) {
    companyBudgetRows[index][field] = value;

     if (field === 'credit' || field === 'debit') {
        calculateBalance(index);
    }
}


function calculateBalance(index) {
    const row = companyBudgetRows[index];
    
    const credit = parseFloat(row.credit) || 0;
    const debit = parseFloat(row.debit) || 0;
    
    // Balance = Credit - Debit
    const balance = credit - debit;
    
    // Update the balance in the data
    companyBudgetRows[index].balance = balance;
    
    // Update the balance input field in the UI
    const balanceInput = document.querySelector(`#companyBudgetTableBody tr:nth-child(${index + 1}) .balance`);
    if (balanceInput) {
        balanceInput.value = balance;
    }
}

// ===================================
// SUBMIT ALL DATA TO BACKEND
// ===================================

async function submitCompanyBudget() {
    if (companyBudgetRows.length === 0) {
        CommonModal.warning('No data to submit. Please add at least one row.');
        return;
    }
    
    // Validate required fields
    for (let i = 0; i < companyBudgetRows.length; i++) {
        const row = companyBudgetRows[i];
        
        if (!row.date) {
            CommonModal.error(`Row ${i + 1}: Date is required`);
            return;
        }
        
        if (!row.paymentReason || row.paymentReason.trim() === '') {
            CommonModal.error(`Row ${i + 1}: Payment Reason is required`);
            return;
        }
    }

    // Show confirmation modal
    CommonModal.confirm(
        'Are you sure you want to submit all company budget entries?',
        'Confirm Submission',
        async () => {
            await saveAllRows();
        }
    );
}

// ===================================
// SAVE ALL ROWS TO BACKEND
// ===================================

async function saveAllRows() {
    isLoading = true;
    let successCount = 0;
    let failCount = 0;

    for (const row of companyBudgetRows) {
        try {
            const dataToSend = {
                date: row.date,
                payment_reason: row.paymentReason,
                payment_mode: row.paymentMode,
                credit: row.credit || 0,
                debit: row.debit || 0,
                balance: row.balance || 0,
                given_member: row.givenMember,
                receive_member: row.receiveMember,
                remarks: row.remarks
            };

            let response;
            
            if (row.id) {
                // Update existing row
                dataToSend.id = row.id;
                response = await fetch(COMPANY_BUDGET_API.BASE_URL + COMPANY_BUDGET_API.UPDATE, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend)
                });
            } else {
                // Create new row
                response = await fetch(COMPANY_BUDGET_API.BASE_URL + COMPANY_BUDGET_API.CREATE, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend)
                });
            }

            const result = await response.json();

            if (result.status === 'success') {
                if (!row.id && result.id) {
                    row.id = result.id; // Set ID for newly created rows
                }
                successCount++;
            } else {
                failCount++;
                console.error('Failed to save row:', result.message);
            }

        } catch (error) {
            failCount++;
            console.error('Error saving row:', error);
        }
    }

    isLoading = false;

    if (successCount > 0 && failCount === 0) {
        CommonModal.success(`All ${successCount} entries saved successfully!`, 'Success', 3000, () => {
            fetchCompanyBudgetData(); // Refresh data
        });
    } else if (successCount > 0 && failCount > 0) {
        CommonModal.warning(`${successCount} entries saved, but ${failCount} failed. Please check console for details.`);
    } else {
        CommonModal.error('Failed to save entries. Please try again.');
    }
}

// ===================================
// DELETE ROW WITH CONFIRMATION
// ===================================

function deleteCompanyBudgetRow(index) {
    const row = companyBudgetRows[index];

    CommonModal.confirm(
        'Are you sure you want to delete this entry? This action cannot be undone.',
        'Confirm Deletion',
        async () => {
            if (row.id) {
                // Delete from backend
                await deleteFromBackend(row.id, index);
            } else {
                // Just remove from local array (not yet saved)
                companyBudgetRows.splice(index, 1);
                renderCompanyBudgetTable();
                CommonModal.success('Entry removed successfully', 'Deleted', 2000);
            }
        }
    );
}

// ===================================
// DELETE FROM BACKEND
// ===================================

async function deleteFromBackend(id, index) {
    try {
        const response = await fetch(`${COMPANY_BUDGET_API.BASE_URL}${COMPANY_BUDGET_API.DELETE}?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (result.status === 'success') {
            companyBudgetRows.splice(index, 1);
            renderCompanyBudgetTable();
            CommonModal.success('Entry deleted successfully from database', 'Deleted', 2000);
        } else {
            throw new Error(result.message || 'Failed to delete');
        }

    } catch (error) {
        console.error('❌ Error deleting entry:', error);
        CommonModal.error('Failed to delete entry: ' + error.message);
    }
}

// ===================================
// CLEAR ALL DATA (WITH CONFIRMATION)
// ===================================

function clearCompanyBudget() {
    CommonModal.confirm(
        'Are you sure you want to clear all company budget data? This will remove all entries from the table but NOT from the database.',
        'Clear All Data',
        () => {
            companyBudgetRows = [];
            renderCompanyBudgetTable();
            CommonModal.success('All company budget data has been cleared from the table', 'Cleared', 2000);
        }
    );
}

// ===================================
// EXPORT TO CSV
// ===================================

function exportCompanyBudgetToCSV() {
    if (companyBudgetRows.length === 0) {
        CommonModal.warning('No data to export');
        return;
    }
    
    const headers = ['Date', 'Payment Reason', 'Payment Mode', 'Credit', 'Debit', 'Balance', 'Given Member', 'Receive Member', 'Remarks'];
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
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `company-budget-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    CommonModal.success('Company budget exported successfully', 'Exported', 2000);
}
