/* =================================== 
   HR SALARY BUDGET - COMPLETE JAVASCRIPT WITH PHP BACKEND
=================================== */

// ==================== GLOBAL VARIABLES ====================
let currentMonth = new Date().getMonth() + 1; // 1-12
let currentYear = new Date().getFullYear();
let selectedYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth() + 1; // 1 = Jan
let currentView = "list";
let currentDetailYear = null;
let currentDetailMonth = null;
let currentDetailMonthNumber = null;

// API base URL - adjust this to your server path
const API_BASE_URL =
  "https://www.fist-o.com/fisto_finance_app/api/budget/salary/";

// ==================== INITIALIZATION ====================
function initializeHRSalaryPage() {
  console.log("Initializing HR Salary Page...");
  loadCompletedMonths();
  setupCalendar();
  setupBackButton();
  setupDateFilter(); // NEW: Add date filter setup
  setupGenerateButton();
  console.log("HR Salary Page initialized successfully!");
}

// ==================== API CALLS ====================

// Fetch completed months
async function loadCompletedMonths() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/get_completed_months.php?year=${currentYear}`
    );
    const result = await response.json();

    if (result.success) {
      renderMonthList(result.data);
    } else {
      console.error("Failed to load months:", result.message);
    }
  } catch (error) {
    console.error("Error loading months:", error);
  }
}

// Fetch employees with salary data for a specific month
async function loadEmployeesWithSalary(month, year) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/get_employees_with_salary.php?month=${month}&year=${year}`
    );
    const result = await response.json();

    if (result.success) {
      renderDetailTable(result.data, month, year);
    } else {
      console.error("Failed to load employees:", result.message);
    }
  } catch (error) {
    console.error("Error loading employees:", error);
  }
}

// Fetch salary details for specific employee and month
async function loadSalaryDetails(employeeId, month, year) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/get_salary_details.php?employee_id=${employeeId}&month=${month}&year=${year}`
    );
    const result = await response.json();

    if (result.success) {
      return result;
    } else {
      console.error("Failed to load salary details:", result.message);
      return null;
    }
  } catch (error) {
    console.error("Error loading salary details:", error);
    return null;
  }
}

// ==================== DATE FILTER SETUP ====================
function setupDateFilter() {
    const dateSelector = document.getElementById('hrSalaryDateSelector');
    if (!dateSelector) {
        console.warn('Date selector not found!');
        return;
    }

    // Set default value to current date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateSelector.value = `${year}-${month}-${day}`;

    // Listen for date changes
    dateSelector.addEventListener('change', function() {
        const selectedDate = this.value; // Format: YYYY-MM-DD
        
        if (!selectedDate) {
            console.warn('No date selected');
            return;
        }

        // Parse the selected date
        const dateParts = selectedDate.split('-');
        const selectedYear = parseInt(dateParts[0], 10);
        const selectedMonth = parseInt(dateParts[1], 10);
        
        console.log('Date changed:', selectedDate);
        console.log('Parsed - Year:', selectedYear, 'Month:', selectedMonth);
        
        // Update global variables
        window.selectedYear = selectedYear;
        window.selectedMonth = selectedMonth;
        
        // Fetch data for selected year/month
        if (currentView === 'list') {
            // On main list view, reload months for the selected year
            loadCompletedMonths(selectedYear);
        } else if (currentView === 'detail') {
            // On detail view, reload employees for selected month/year
            loadEmployeesWithSalary(selectedMonth, selectedYear);
            
            // Update current detail view variables
            currentDetailYear = selectedYear;
            currentDetailMonth = getMonthName(selectedMonth);
            currentDetailMonthNumber = selectedMonth;
        }
    });
}

// Helper function to get month name
function getMonthName(monthNumber) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNumber - 1];
}

// ==================== MONTH LIST TABLE ====================
function renderMonthList(months) {
  const tbody = document.getElementById("hrSalaryMonthListBody");
  if (!tbody) {
    console.error("Month list tbody not found!");
    return;
  }

  if (months.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: #999;">
                    No completed months available
                </td>
            </tr>
        `;
    return;
  }

  const rows = months
    .map(
      (item) => `
        <tr>
            <td>${item.sno}</td>
            <td>${item.year}</td>
            <td>${item.month}</td>
            <td>
                <button 
                    class="hr-salary-click-btn" 
                    data-year="${item.year}" 
                    data-month="${item.month}"
                    data-month-number="${item.month_number}">
                    Click
                </button>
            </td>
        </tr>
    `
    )
    .join("");

  tbody.innerHTML = rows;
  currentView = "list";
  setupMonthClickHandlers();
}

function setupMonthClickHandlers() {
  const monthList = document.getElementById("hrSalaryMonthList");
  if (!monthList) {
    console.error("Month list not found!");
    return;
  }

  monthList.addEventListener("click", function (e) {
    if (e.target.classList.contains("hr-salary-click-btn")) {
      const year = e.target.getAttribute("data-year");
      const month = e.target.getAttribute("data-month");
      const monthNumber = e.target.getAttribute("data-month-number");

      console.log("Month clicked:", month, year, monthNumber);
      showDetailView(year, month, monthNumber);
    }
  });
}

// ==================== DETAIL VIEW TABLE ====================
function showDetailView(year, month, monthNumber) {
  console.log("Showing detail view for:", month, year);

  document.getElementById("hrSalaryMonthList").style.display = "none";
  document.getElementById("hrSalaryDetailView").style.display = "block";
  document.getElementById("hrSalaryBackBtn").style.display = "block";
  document.getElementById("hrSalaryGenerateBtn").style.display = "block";

  currentView = "detail";
  currentDetailYear = year;
  currentDetailMonth = month;
  currentDetailMonthNumber = monthNumber;

  // Load employees with salary data
  loadEmployeesWithSalary(monthNumber, year);
}

// Update the renderDetailTable function to use correct field names
function renderDetailTable(employees, month, year) {
  const tbody = document.getElementById("hrSalaryDetailBody");
  if (!tbody) {
    console.error("Detail tbody not found!");
    return;
  }

  if (employees.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
                    No employees found. Please add employees first.
                </td>
            </tr>
        `;
    return;
  }

  const monthNames = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  const rows = employees
    .map((emp) => {
      const hasSalary = emp.hasSalary;
      const salaryData = emp.salaryData;

      // Map employment_type to display format
      const jobRoleClass = emp.jobRole === "On Role" ? "onrole" : "intern";

      return `
            <tr>
                <td>${emp.employeeId}</td>
                <td>
                    <span class="hr-salary-avatar">${emp.employeeName.charAt(
                      0
                    )}</span>
                    ${emp.employeeName}
                </td>
                <td>${hasSalary ? salaryData.date : "-"}</td>
                <td>${monthNames[month]}</td>
                <td>${year}</td>
                <td>${emp.designation || "N/A"}</td>
                <td>
                    <span class="hr-salary-jobrole-badge hr-salary-jobrole-${jobRoleClass}">
                        ${emp.jobRole}
                    </span>
                </td>
                <td>${
                  hasSalary
                    ? "₹ " +
                      parseFloat(salaryData.totalSalary).toLocaleString("en-IN")
                    : "-"
                }</td>
                <td>
                    <button 
                        class="hr-salary-view-btn" 
                        data-emp-id="${emp.employeeId}" 
                        data-year="${year}" 
                        data-month="${month}">
                        <img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon" />
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");

  tbody.innerHTML = rows;
  attachViewButtonListeners();
}

// Update saveSalaryRecord to include user tracking if needed
async function saveSalaryRecord(salaryData) {
  try {
    // Add current user if you have session/auth system
    // salaryData.updated_by = 'current_logged_in_user';

    const response = await fetch(`${API_BASE_URL}/update_salary.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(salaryData),
    });

    const result = await response.json();
    console.log(`Result: ${result}`);
    return result;
  } catch (error) {
    console.error("Error saving salary:", error);
    return { success: false, message: "Network error" };
  }
}

function attachViewButtonListeners() {
  const viewButtons = document.querySelectorAll(".hr-salary-view-btn");
  console.log("Attaching listeners to", viewButtons.length, "view buttons");

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", async function () {
      const empId = this.getAttribute("data-emp-id");
      const year = this.getAttribute("data-year");
      const month = this.getAttribute("data-month");

      console.log("View clicked for:", empId, month, year);

      // Load salary details and open modal
      const result = await loadSalaryDetails(empId, month, year);
      if (result) {
        openSalaryGenerateModal(
          result.employee,
          result.salaryRecord,
          month,
          year
        );
      }
    });
  });
}

// ==================== BACK BUTTON ====================
function setupBackButton() {
  const backBtn = document.getElementById("hrSalaryBackBtn");
  if (!backBtn) {
    console.error("Back button not found!");
    return;
  }

  backBtn.onclick = function () {
    console.log("Back button clicked");
    document.getElementById("hrSalaryDetailView").style.display = "none";
    document.getElementById("hrSalaryMonthList").style.display = "block";
    document.getElementById("hrSalaryBackBtn").style.display = "none";
    document.getElementById("hrSalaryGenerateBtn").style.display = "none";

    currentView = "list";
    selectedMonth = null;
    selectedYear = null;

    loadCompletedMonths();
  };
}

// ==================== GENERATE SALARY BUTTON ====================
function setupGenerateButton() {
  const generateBtn = document.getElementById("hrSalaryGenerateBtn");
  if (!generateBtn) {
    console.error("Generate button not found!");
    return;
  }

  generateBtn.onclick = function () {
    console.log("Generate salary button clicked");
    // Open modal without pre-filled data
    openSalaryGenerateModal(
      null,
      null,
      currentDetailMonthNumber,
      currentDetailYear
    );
  };
}

// ==================== SALARY GENERATE MODAL ====================
function openSalaryGenerateModal(employee, salaryRecord, month, year) {
  // Dispatch event to open Astro modal component
  const event = new CustomEvent("openGenerateModal", {
    detail: {
      employee: employee,
      salaryRecord: salaryRecord,
      month: month,
      year: year,
    },
  });
  document.dispatchEvent(event);
}

// Listen for salary save from modal
document.addEventListener("saveSalaryRecord", async function (e) {
  const salaryData = e.detail;

  // Save to database
  const result = await saveSalaryRecord(salaryData);

  if (result.success) {
    if (window.CommonModal) {
      window.CommonModal.success(result.message);
    } else {
      alert(result.message);
    }

    // Refresh the detail table
    if (currentView === "detail") {
      loadEmployeesWithSalary(currentDetailMonthNumber, currentDetailYear);
    }
  } else {
    if (window.CommonModal) {
      window.CommonModal.error(result.message, "Error");
    } else {
      alert("Error: " + result.message);
    }
  }
});

// ==================== CALENDAR FUNCTIONS ====================
function setupCalendar() {
  const header = document.querySelector(".hr-salary-calendar-header");
  const dropdown = document.getElementById("hrSalaryCalendarDropdown");

  if (!header || !dropdown) {
    console.error("Calendar elements not found!");
    return;
  }

  header.onclick = (e) => {
    e.stopPropagation();
    const isVisible = dropdown.style.display === "block";
    dropdown.style.display = isVisible ? "none" : "block";

    if (!isVisible) {
      renderMonthYearPicker();
    }
  };

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".hr-salary-calendar-widget")) {
      dropdown.style.display = "none";
    }
  });

}

function renderMonthYearPicker() {
  const dropdown = document.getElementById("hrSalaryCalendarDropdown");
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let pickerHTML = `
        <div class="hr-salary-calendar-month-year">
            <button id="hrSalaryPrevYear" class="hr-salary-calendar-navbutton">◄</button>
            <span style="font-size: .8vw; font-weight: 600;">${currentYear}</span>
            <button id="hrSalaryNextYear" class="hr-salary-calendar-navbutton">►</button>
        </div>
        <div class="hr-salary-month-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin: 10px 0;">
    `;

  monthNames.forEach((month, index) => {
    const isSelected = selectedMonth === index && selectedYear === currentYear;
    pickerHTML += `
            <div class="hr-salary-month-item" data-month="${index}" 
                style="padding: 12px; text-align: center; border-radius: 8px; cursor: pointer; 
                       background: ${isSelected ? "#0052CC" : "#f5f5f5"}; 
                       color: ${isSelected ? "white" : "#333"}; 
                       font-family: 'Gilroy-SemiBold', sans-serif; 
                       transition: all 0.2s; font-size: 0.8vw;">
                ${month.substring(0, 3)}
            </div>
        `;
  });

  pickerHTML += `
        </div>
        <div class="hr-salary-calendar-actions" style="display: flex; justify-content: flex-end; gap: 10px; padding: 10px; border-top: 1px solid #e5e7eb;">
            <button id="hrSalaryCancelPickerBtn" 
                style="background: transparent; color: #0052CC; border: none; padding: 6px 16px; cursor: pointer; font-family: 'Gilroy-SemiBold'; font-size: 0.8vw; border-radius: 5px;">
                CANCEL
            </button>
            <button id="hrSalaryOkPickerBtn" 
                style="background: #0052CC; color: white; border: none; padding: 6px 16px; cursor: pointer; font-family: 'Gilroy-SemiBold'; font-size: 0.8vw; border-radius: 5px;">
                OK
            </button>
        </div>
    `;

  dropdown.innerHTML = pickerHTML;

  // Attach event listeners after rendering
  setTimeout(() => {
    const prevBtn = document.getElementById("hrSalaryPrevYear");
    const nextBtn = document.getElementById("hrSalaryNextYear");

    if (prevBtn)
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        changeYear(-1);
      };
    if (nextBtn)
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        changeYear(1);
      };

    const monthItems = dropdown.querySelectorAll(".hr-salary-month-item");
    monthItems.forEach((item) => {
      const monthIndex = parseInt(item.getAttribute("data-month"));
      item.onclick = (e) => {
        e.stopPropagation();
        selectMonthYear(monthIndex);
      };

      if (selectedMonth !== monthIndex || selectedYear !== currentYear) {
        item.addEventListener("mouseenter", function () {
          this.style.background = "#e3f2fd";
        });
        item.addEventListener("mouseleave", function () {
          this.style.background = "#f5f5f5";
        });
      }
    });

    const cancelBtn = document.getElementById("hrSalaryCancelPickerBtn");
    const okBtn = document.getElementById("hrSalaryOkPickerBtn");

    if (cancelBtn)
      cancelBtn.onclick = (e) => {
        e.stopPropagation();
        cancelMonthSelection();
      };
    if (okBtn)
      okBtn.onclick = (e) => {
        e.stopPropagation();
        confirmMonthSelection();
      };
  }, 10);
}

function changeYear(delta) {
  currentYear += delta;
  renderMonthYearPicker();
}

function selectMonthYear(monthIndex) {
  selectedMonth = monthIndex;
  selectedYear = currentYear;
  renderMonthYearPicker();
}

function confirmMonthSelection() {
  if (selectedMonth !== null && selectedYear !== null) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formatted = `${monthNames[selectedMonth]} ${selectedYear}`;
    const label = document.getElementById("hrSalaryCalendarLabel");
    if (label) label.textContent = formatted;

    const dropdown = document.getElementById("hrSalaryCalendarDropdown");
    if (dropdown) dropdown.style.display = "none";

    // Filter based on current view
    // You can add filtering logic here if needed
  }
}

function cancelMonthSelection() {
  const dropdown = document.getElementById("hrSalaryCalendarDropdown");
  if (dropdown) dropdown.style.display = "none";
}

// ==================== GLOBAL EXPORTS & INITIALIZATION ====================
if (typeof window !== "undefined") {
  window.initializeHRSalaryPage = initializeHRSalaryPage;
  window.loadCompletedMonths = loadCompletedMonths;
  window.loadEmployeesWithSalary = loadEmployeesWithSalary;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, checking for Salary Budget tab...");
  const salaryTab = document.getElementById("salary-budget");

  if (salaryTab) {
    console.log("Salary Budget tab found, initializing...");
    initializeHRSalaryPage();
  }
});

// Also initialize when salary tab button is clicked
document.addEventListener("click", function (e) {
  if (
    e.target &&
    e.target.getAttribute &&
    e.target.getAttribute("data-tab") === "salary-budget"
  ) {
    console.log("Salary budget tab clicked");
    setTimeout(() => {
      initializeHRSalaryPage();
    }, 100);
  }
});
