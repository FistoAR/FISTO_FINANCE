/* ===================================
   HR SALARY BUDGET - COMPLETE JAVASCRIPT (FIXED)
   =================================== */

// ==================== HR SALARY DATA ====================
const hrSalaryEmployees = [
  {
    id: "FSTNTI01",
    name: "Sham",
    designation: "Team Head",
    jobRole: "On role",
    basicSalary: 12000,
  },
  {
    id: "FSTNTI02",
    name: "Sameer",
    designation: "Developer",
    jobRole: "On role",
    basicSalary: 15000,
  },
  {
    id: "FSTNTI03",
    name: "Shafi",
    designation: "Designer",
    jobRole: "Intern",
    basicSalary: 8000,
  },
  {
    id: "FSTNTI04",
    name: "Harish",
    designation: "Tester",
    jobRole: "On role",
    basicSalary: 11000,
  },
];

const hrSalaryRecords = [
  {
    employeeId: "FSTNTI01",
    employeeName: "Sham",
    designation: "Team Head",
    jobRole: "On role",
    date: "02 OCT 2025",
    month: "October",
    year: "2025",
    basicSalary: 12000,
    deductions: 500,
    incentive: 2000,
    bonus: 1000,
    medical: 500,
    lossOfPay: 0,
    otherAllowance: 1000,
    totalSalary: 16000,
  },
  {
    employeeId: "FSTNTI02",
    employeeName: "Sameer",
    designation: "Developer",
    jobRole: "On role",
    date: "02 OCT 2025",
    month: "October",
    year: "2025",
    basicSalary: 15000,
    deductions: 1000,
    incentive: 3000,
    bonus: 2000,
    medical: 500,
    lossOfPay: 0,
    otherAllowance: 1500,
    totalSalary: 21000,
  },
  {
    employeeId: "FSTNTI03",
    employeeName: "Shafi",
    designation: "Designer",
    jobRole: "Intern",
    date: "02 SEP 2025",
    month: "September",
    year: "2025",
    basicSalary: 8000,
    deductions: 200,
    incentive: 500,
    bonus: 0,
    medical: 300,
    lossOfPay: 0,
    otherAllowance: 500,
    totalSalary: 9100,
  },
  {
    employeeId: "FSTNTI04",
    employeeName: "Harish",
    designation: "Tester",
    jobRole: "On role",
    date: "02 AUG 2025",
    month: "August",
    year: "2025",
    basicSalary: 11000,
    deductions: 800,
    incentive: 1500,
    bonus: 1000,
    medical: 400,
    lossOfPay: 0,
    otherAllowance: 800,
    totalSalary: 13900,
  },
];

const hrSalaryMonthData = [
  { sno: 1, year: 2025, month: "October" },
  { sno: 2, year: 2025, month: "September" },
  { sno: 3, year: 2025, month: "August" },
  { sno: 4, year: 2024, month: "July" },
];

// ==================== GLOBAL VARIABLES ====================
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedMonth = null;
let selectedYear = null;
let currentView = "list";
let currentDetailYear = null;
let currentDetailMonth = null;

// ==================== INITIALIZATION ====================
function initializeHRSalaryPage() {
  console.log("Initializing HR Salary Page...");

  renderMonthList();
  setupCalendar();
  setupGenerateButton();
  setupMonthClickHandlers();
  setupBackButton();

  console.log("HR Salary Page initialized successfully!");
}

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
      <button id="hrSalaryPrevYear" class="hr-salary-calendar-nav">◀</button>
      <span style="font-size: .8vw; font-weight: 600;">${currentYear}</span>
      <button id="hrSalaryNextYear" class="hr-salary-calendar-nav">▶</button>
    </div>
    <div class="hr-salary-month-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin: 10px 0;">
  `;

  monthNames.forEach((month, index) => {
    const isSelected = selectedMonth === index && selectedYear === currentYear;
    pickerHTML += `
      <div class="hr-salary-month-item" data-month="${index}" 
           style="padding: 12px; text-align: center; border-radius: 8px; cursor: pointer; background: ${
             isSelected ? "#0052CC" : "#f5f5f5"
           }; color: ${
      isSelected ? "white" : "#333"
    }; font-family: 'Gilroy-SemiBold', sans-serif; transition: all 0.2s; font-size: 0.8vw;">
        ${month.substring(0, 3)}
      </div>
    `;
  });

  pickerHTML += `
    </div>
    <div class="hr-salary-calendar-actions" style="display: flex; justify-content: flex-end; gap: 10px; padding: 10px; border-top: 1px solid #e5e7eb;">
      <button id="hrSalaryCancelPickerBtn" style="background: transparent; color: #0052CC; border: none; padding: 6px 16px; cursor: pointer; font-family: 'Gilroy-SemiBold'; font-size: 0.8vw; border-radius: 5px;">CANCEL</button>
      <button id="hrSalaryOkPickerBtn" style="background: #0052CC; color: white; border: none; padding: 6px 16px; cursor: pointer; font-family: 'Gilroy-SemiBold'; font-size: 0.8vw; border-radius: 5px;">OK</button>
    </div>
  `;

  dropdown.innerHTML = pickerHTML;

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

    if (cancelBtn) {
      cancelBtn.onclick = (e) => {
        e.stopPropagation();
        cancelMonthSelection();
      };
    }

    if (okBtn) {
      okBtn.onclick = (e) => {
        e.stopPropagation();
        confirmMonthSelection();
      };
    }
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
    if (label) {
      label.textContent = formatted;
    }

    const dropdown = document.getElementById("hrSalaryCalendarDropdown");
    if (dropdown) {
      dropdown.style.display = "none";
    }

    if (currentView === "list") {
      filterMonthList(monthNames[selectedMonth], selectedYear.toString());
    } else if (currentView === "detail") {
      filterDetailTable(monthNames[selectedMonth], selectedYear.toString());
    }
  }
}

function cancelMonthSelection() {
  const dropdown = document.getElementById("hrSalaryCalendarDropdown");
  if (dropdown) {
    dropdown.style.display = "none";
  }
}

// ==================== FILTERING FUNCTIONS ====================
function filterMonthList(month, year) {
  const tbody = document.getElementById("hrSalaryMonthListBody");
  if (!tbody) return;

  const filtered = hrSalaryMonthData.filter(
    (item) => item.month === month && item.year.toString() === year
  );

  tbody.innerHTML = "";

  if (filtered.length > 0) {
    filtered.forEach((item) => {
      tbody.innerHTML += `
        <tr>
          <td>${item.sno}</td>
          <td>${item.year}</td>
          <td>${item.month}</td>
          <td><button class="hr-salary-click-btn" data-year="${item.year}" data-month="${item.month}">Click</button></td>
        </tr>
      `;
    });
  } else {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #999;">No records found for ' +
      month +
      " " +
      year +
      "</td></tr>";
  }
}

function filterDetailTable(month, year) {
  const filteredRecords = hrSalaryRecords.filter(
    (r) => r.month === month && r.year.toString() === year
  );

  const tbody = document.getElementById("hrSalaryDetailBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (filteredRecords.length > 0) {
    filteredRecords.forEach((record) => {
      tbody.innerHTML += `
        <tr>
          <td>${record.employeeId}</td>
          <td><span class="hr-salary-avatar">${record.employeeName[0]}</span>${
        record.employeeName
      }</td>
          <td>${record.date}</td>
          <td>${record.month}</td>
          <td>${record.year}</td>
          <td>${record.designation}</td>
          <td><span class="hr-salary-jobrole-badge hr-salary-jobrole-${record.jobRole
            .toLowerCase()
            .replace(" ", "")}">${record.jobRole}</span></td>
          <td>₹ ${record.totalSalary.toLocaleString()}</td>
          <td>
            <button class="hr-salary-view-btn" 
                    data-emp-id="${record.employeeId}" 
                    data-year="${year}" 
                    data-month="${month}">
              View
            </button>
          </td>
        </tr>
      `;
    });

    attachViewButtonListeners();
  } else {
    tbody.innerHTML =
      '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">No salary records found for ' +
      month +
      " " +
      year +
      "</td></tr>";
  }
}

// ==================== MONTH LIST TABLE ====================
function renderMonthList() {
  const tbody = document.getElementById("hrSalaryMonthListBody");
  if (!tbody) {
    console.error("Month list tbody not found!");
    return;
  }

  tbody.innerHTML = "";
  hrSalaryMonthData.forEach((item) => {
    tbody.innerHTML += `
      <tr>
        <td>${item.sno}</td>
        <td>${item.year}</td>
        <td>${item.month}</td>
        <td><button class="hr-salary-click-btn" data-year="${item.year}" data-month="${item.month}">Click</button></td>
      </tr>
    `;
  });

  currentView = "list";
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
      console.log("Month clicked:", month, year);
      showDetailView(year, month);
    }
  });
}

// ==================== DETAIL VIEW TABLE ====================
function showDetailView(year, month) {
  console.log("Showing detail view for:", month, year);

  document.getElementById("hrSalaryMonthList").style.display = "none";
  document.getElementById("hrSalaryDetailView").style.display = "block";
  document.getElementById("hrSalaryBackBtn").style.display = "block";
  document.getElementById("hrSalaryGenerateBtn").style.display = "block";

  currentView = "detail";
  currentDetailYear = year;
  currentDetailMonth = month;

  renderDetailTable(year, month);
}

function renderDetailTable(year, month) {
  const tbody = document.getElementById("hrSalaryDetailBody");
  if (!tbody) {
    console.error("Detail tbody not found!");
    return;
  }

  const filteredRecords = hrSalaryRecords.filter(
    (r) => r.year.toString() === year.toString() && r.month === month
  );

  tbody.innerHTML = "";

  if (filteredRecords.length > 0) {
    filteredRecords.forEach((record) => {
      tbody.innerHTML += `
        <tr>
          <td>${record.employeeId}</td>
          <td><span class="hr-salary-avatar">${record.employeeName[0]}</span>${
        record.employeeName
      }</td>
          <td>${record.date}</td>
          <td>${record.month}</td>
          <td>${record.year}</td>
          <td>${record.designation}</td>
          <td><span class="hr-salary-jobrole-badge hr-salary-jobrole-${record.jobRole
            .toLowerCase()
            .replace(" ", "")}">${record.jobRole}</span></td>
          <td>₹ ${record.totalSalary.toLocaleString()}</td>
          <td>
            <button class="hr-salary-view-btn" 
                    data-emp-id="${record.employeeId}" 
                    data-year="${year}" 
                    data-month="${month}">
              <img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon">
            </button>
          </td>
        </tr>
      `;
    });

    attachViewButtonListeners();
  } else {
    tbody.innerHTML =
      '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">No salary records found. Click "Generate Salary" to add records.</td></tr>';
  }
}

function attachViewButtonListeners() {
  const viewButtons = document.querySelectorAll(".hr-salary-view-btn");
  console.log("Attaching listeners to", viewButtons.length, "view buttons");

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const empId = this.getAttribute("data-emp-id");
      const year = this.getAttribute("data-year");
      const month = this.getAttribute("data-month");
      console.log("View clicked for:", empId, month, year);
      viewSalaryDetails(empId, year, month);
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

    renderMonthList();
  };
}

// ==================== GENERATE SALARY MODAL ====================
function setupGenerateButton() {
  const generateBtn = document.getElementById("hrSalaryGenerateBtn");
  if (!generateBtn) {
    console.error("Generate button not found!");
    return;
  }

  generateBtn.onclick = function () {
    console.log("Generate salary button clicked");
    showGenerateSalaryModal();
  };
}

function showGenerateSalaryModal() {
  const modal = createGenerateModal();
  document.body.appendChild(modal);
}

function createGenerateModal() {
  const modal = document.createElement("div");
  modal.id = "hrSalaryGenerateModal";

  modal.innerHTML = `
    <div class="hr-salary-modal-content">
      <div class="hr-salary-modal-header">
        <h2>Edit/Update Employee Salary</h2>
        <span id="hrSalaryModalClose" class="hr-salary-modal-close">&times;</span>
      </div>

      <div class="hr-salary-modal-body">
        <div class="hr-salary-form-section">
          <h3 class="hr-salary-section-title">
            <img src="/FISTO_FINANCE/assets/images/contactB_icon.webp" alt="contact icon"> Professional Information
          </h3>
          <div class="hr-salary-form-row">
            <div class="hr-salary-form-group full-width hr-salary-employee-search">
              <label class="hr-salary-label">Employee Name <span class="required">*</span></label>
              <input type="text" id="hrSalaryEmployeeSearch" class="hr-salary-input" placeholder="Search employee name...">
              <div id="hrSalarySearchResults" class="hr-salary-search-results" style="display: none;"></div>
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Employee ID</label>
              <input type="text" id="hrSalaryEmpId" class="hr-salary-input" readonly>
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Designation</label>
              <input type="text" id="hrSalaryDesignation" class="hr-salary-input" readonly>
            </div>
            <div class="hr-salary-form-group full-width">
              <label class="hr-salary-label">Job Role</label>
              <input type="text" id="hrSalaryJobRole" class="hr-salary-input" readonly>
            </div>
          </div>
        </div>

        <div class="hr-salary-form-section">
          <h3 class="hr-salary-section-title">
            <img src="/FISTO_FINANCE/assets/images/salaryB_icon.webp" alt="contact icon"> Salary Information
          </h3>
          <div class="hr-salary-form-row">
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Basic Salary</label>
              <input type="number" id="hrSalaryBasic" class="hr-salary-input" placeholder="₹ 5000">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Deductions</label>
              <input type="number" id="hrSalaryDeductions" class="hr-salary-input" placeholder="₹ Amount">
            </div>
          </div>
        </div>

        <div class="hr-salary-form-section">
          <h3 class="hr-salary-section-title">
            <img src="/FISTO_FINANCE/assets/images/iB_icon.webp" alt="contact icon"> Other Information
          </h3>
          <div class="hr-salary-form-row">
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Incentive</label>
              <input type="number" id="hrSalaryIncentive" class="hr-salary-input" placeholder="₹ Amount">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Total Leave Days</label>
              <input type="number" id="hrSalaryLeaveDays" class="hr-salary-input" placeholder="No of days">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Bonus</label>
              <input type="number" id="hrSalaryBonus" class="hr-salary-input" placeholder="₹ 5000">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Medical</label>
              <input type="number" id="hrSalaryMedical" class="hr-salary-input" placeholder="₹ 5000">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Loss of Pay</label>
              <input type="number" id="hrSalaryLossOfPay" class="hr-salary-input" placeholder="₹ 5000">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Other Allowance</label>
              <input type="number" id="hrSalaryOtherAllowance" class="hr-salary-input" placeholder="₹ 5000">
            </div>
          </div>
        </div>
      </div>

      <div class="hr-salary-modal-footer">
        <div class="hr-salary-form-actions">
          <button id="hrSalaryUpdateBtn" class="hr-salary-btn-submit">Update Employee</button>
        </div>
      </div>
    </div>
  `;

  modal.style.cssText =
    "display: flex; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); backdrop-filter: blur(5px); align-items: center; justify-content: center;";

  setTimeout(() => {
    setupEmployeeSearch();

    // FIXED: Remove the non-existent button reference
    document.getElementById("hrSalaryModalClose").onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.getElementById("hrSalaryUpdateBtn").onclick = function () {
      saveSalaryRecord();
      modal.remove();
    };
  }, 100);

  return modal;
}

// ==================== EMPLOYEE SEARCH ====================
function setupEmployeeSearch() {
  const searchInput = document.getElementById("hrSalaryEmployeeSearch");
  const resultsDiv = document.getElementById("hrSalarySearchResults");

  if (!searchInput || !resultsDiv) {
    console.error("Search elements not found!");
    return;
  }

  searchInput.oninput = function () {
    const query = this.value.toLowerCase();
    if (query.length === 0) {
      resultsDiv.style.display = "none";
      return;
    }

    const filtered = hrSalaryEmployees.filter((emp) =>
      emp.name.toLowerCase().includes(query)
    );

    if (filtered.length > 0) {
      resultsDiv.innerHTML = filtered
        .map(
          (emp) =>
            `<div class="hr-salary-search-item" data-id="${emp.id}">${emp.name}</div>`
        )
        .join("");
      resultsDiv.style.display = "block";
    } else {
      resultsDiv.style.display = "none";
    }
  };

  resultsDiv.onclick = function (e) {
    if (e.target.classList.contains("hr-salary-search-item")) {
      const empId = e.target.getAttribute("data-id");
      const emp = hrSalaryEmployees.find((emp) => emp.id === empId);
      if (emp) {
        searchInput.value = emp.name;
        document.getElementById("hrSalaryEmpId").value = emp.id;
        document.getElementById("hrSalaryDesignation").value = emp.designation;
        document.getElementById("hrSalaryJobRole").value = emp.jobRole;
        document.getElementById("hrSalaryBasic").value = emp.basicSalary;
        resultsDiv.style.display = "none";
      }
    }
  };
}

// ==================== SAVE SALARY RECORD ====================
function saveSalaryRecord() {
  const employeeId = document.getElementById("hrSalaryEmpId").value;
  const employeeName = document.getElementById("hrSalaryEmployeeSearch").value;

  if (!employeeId || !employeeName) {
    CommonModal.error("Please select an employee first", "Validation Error");
    return;
  }

  const record = {
    employeeId: employeeId,
    employeeName: employeeName,
    designation: document.getElementById("hrSalaryDesignation").value,
    jobRole: document.getElementById("hrSalaryJobRole").value,
    date: new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase(),
    month: currentDetailMonth || "October",
    year: currentDetailYear || "2025",
    basicSalary: parseFloat(
      document.getElementById("hrSalaryBasic").value || 0
    ),
    deductions: parseFloat(
      document.getElementById("hrSalaryDeductions").value || 0
    ),
    incentive: parseFloat(
      document.getElementById("hrSalaryIncentive").value || 0
    ),
    bonus: parseFloat(document.getElementById("hrSalaryBonus").value || 0),
    medical: parseFloat(document.getElementById("hrSalaryMedical").value || 0),
    lossOfPay: parseFloat(
      document.getElementById("hrSalaryLossOfPay").value || 0
    ),
    otherAllowance: parseFloat(
      document.getElementById("hrSalaryOtherAllowance").value || 0
    ),
    totalSalary: 0,
  };

  record.totalSalary =
    record.basicSalary +
    record.incentive +
    record.bonus +
    record.medical +
    record.otherAllowance -
    record.deductions -
    record.lossOfPay;

  // Check if record already exists
  const existingIndex = hrSalaryRecords.findIndex(
    (r) =>
      r.employeeId === record.employeeId &&
      r.month === record.month &&
      r.year === record.year
  );

  if (existingIndex !== -1) {
    hrSalaryRecords[existingIndex] = record;
    CommonModal.success('Salary updated successfully!');
  } else {
    hrSalaryRecords.push(record);
    CommonModal.success('Salary record created successfully!');
  }

  renderDetailTable(record.year, record.month);
}

// ==================== VIEW SALARY DETAILS ====================
function viewSalaryDetails(empId, year, month) {
  const record = hrSalaryRecords.find(
    (r) =>
      r.employeeId === empId &&
      r.year.toString() === year.toString() &&
      r.month === month
  );

  if (record) {
    showViewDetailsModal(record);
  } else {
    CommonModal.error('Record not found!', 'Not Found');
  }
}

function showViewDetailsModal(record) {
  const modal = document.createElement("div");
  modal.id = "hrSalaryViewModal";

  modal.innerHTML = `
    <div class="hr-salary-modal-content">
      <div class="hr-salary-modal-header">
        <h2>Salary Details - ${record.employeeName}</h2>
        <span class="hr-salary-modal-close" id="hrSalaryViewClose">&times;</span>
      </div>

      <div class="hr-salary-modal-body">
        
        <div class="hr-salary-form-section">
          <h3 class="hr-salary-section-title">
            <img src="/FISTO_FINANCE/assets/images/contactB_icon.webp" alt="contact icon"> Employee Information
          </h3>
          <div class="hr-salary-form-row">
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Employee ID</label>
              <input type="text" id="viewEmpId" class="hr-salary-input" value="${
                record.employeeId
              }" readonly>
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Employee Name</label>
              <input type="text" id="viewEmpName" class="hr-salary-input" value="${
                record.employeeName
              }" readonly>
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Designation</label>
              <input type="text" id="viewDesignation" class="hr-salary-input" value="${
                record.designation
              }" readonly>
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Job Role</label>
              <input type="text" id="viewJobRole" class="hr-salary-input" value="${
                record.jobRole
              }" readonly>
            </div>
          </div>
        </div>

        <div class="hr-salary-form-section">
          <h3 class="hr-salary-section-title">
            <img src="/FISTO_FINANCE/assets/images/salaryB_icon.webp" alt="contact icon"> Salary Breakdown
          </h3>
          <div class="hr-salary-form-row">
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Basic Salary</label>
              <input type="number" id="viewBasicSalary" class="hr-salary-input" value="${
                record.basicSalary
              }">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Incentive</label>
              <input type="number" id="viewIncentive" class="hr-salary-input" value="${
                record.incentive
              }">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Bonus</label>
              <input type="number" id="viewBonus" class="hr-salary-input" value="${
                record.bonus
              }">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Medical</label>
              <input type="number" id="viewMedical" class="hr-salary-input" value="${
                record.medical
              }">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Other Allowance</label>
              <input type="number" id="viewOtherAllowance" class="hr-salary-input" value="${
                record.otherAllowance
              }">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Deductions</label>
              <input type="number" id="viewDeductions" class="hr-salary-input" value="${
                record.deductions
              }">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label">Loss of Pay</label>
              <input type="number" id="viewLossOfPay" class="hr-salary-input" value="${
                record.lossOfPay
              }">
            </div>
            <div class="hr-salary-form-group">
              <label class="hr-salary-label" style="font-weight: bold;">Total Salary</label>
              <input type="text" id="viewTotalSalary" class="hr-salary-input" value="₹ ${record.totalSalary.toLocaleString()}" readonly style="background: #e9f7ef; font-weight: bold; color: #0d6832;">
            </div>
          </div>
        </div>

      </div>

      <div class="hr-salary-modal-footer">
        <div class="hr-salary-form-actions">
          <button id="hrSalaryUpdateViewBtn" class="hr-salary-btn-submit">Update Salary</button>
        </div>
      </div>
    </div>
  `;

  modal.style.cssText =
    "display: flex; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); backdrop-filter: blur(5px); align-items: center; justify-content: center;";

  document.body.appendChild(modal);

  // Auto-calculate total salary on input change
  const calculateTotal = () => {
    const basicSalary =
      parseFloat(document.getElementById("viewBasicSalary").value) || 0;
    const incentive =
      parseFloat(document.getElementById("viewIncentive").value) || 0;
    const bonus = parseFloat(document.getElementById("viewBonus").value) || 0;
    const medical =
      parseFloat(document.getElementById("viewMedical").value) || 0;
    const otherAllowance =
      parseFloat(document.getElementById("viewOtherAllowance").value) || 0;
    const deductions =
      parseFloat(document.getElementById("viewDeductions").value) || 0;
    const lossOfPay =
      parseFloat(document.getElementById("viewLossOfPay").value) || 0;

    const total =
      basicSalary +
      incentive +
      bonus +
      medical +
      otherAllowance -
      deductions -
      lossOfPay;
    document.getElementById("viewTotalSalary").value =
      "₹ " + total.toLocaleString();
  };

  setTimeout(() => {
    // Add event listeners for auto-calculation
    [
      "viewBasicSalary",
      "viewIncentive",
      "viewBonus",
      "viewMedical",
      "viewOtherAllowance",
      "viewDeductions",
      "viewLossOfPay",
    ].forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("input", calculateTotal);
      }
    });

    // Close button handlers
    document.getElementById("hrSalaryViewClose").onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    // Update button handler
    document.getElementById("hrSalaryUpdateViewBtn").onclick = function () {
      // Find and update the record in the array
      const recordIndex = hrSalaryRecords.findIndex(
        (r) =>
          r.employeeId === record.employeeId &&
          r.year.toString() === record.year.toString() &&
          r.month === record.month
      );

      if (recordIndex !== -1) {
        hrSalaryRecords[recordIndex] = {
          ...hrSalaryRecords[recordIndex],
          basicSalary:
            parseFloat(document.getElementById("viewBasicSalary").value) || 0,
          incentive:
            parseFloat(document.getElementById("viewIncentive").value) || 0,
          bonus: parseFloat(document.getElementById("viewBonus").value) || 0,
          medical:
            parseFloat(document.getElementById("viewMedical").value) || 0,
          otherAllowance:
            parseFloat(document.getElementById("viewOtherAllowance").value) ||
            0,
          deductions:
            parseFloat(document.getElementById("viewDeductions").value) || 0,
          lossOfPay:
            parseFloat(document.getElementById("viewLossOfPay").value) || 0,
          totalSalary:
            parseFloat(document.getElementById("viewBasicSalary").value || 0) +
            parseFloat(document.getElementById("viewIncentive").value || 0) +
            parseFloat(document.getElementById("viewBonus").value || 0) +
            parseFloat(document.getElementById("viewMedical").value || 0) +
            parseFloat(
              document.getElementById("viewOtherAllowance").value || 0
            ) -
            parseFloat(document.getElementById("viewDeductions").value || 0) -
            parseFloat(document.getElementById("viewLossOfPay").value || 0),
        };

        console.log("Record updated:", hrSalaryRecords[recordIndex]);
        
        // FIXED: Replace alert with CommonModal
        CommonModal.success('Salary updated successfully!');
        
        renderDetailTable(record.year, record.month);
        modal.remove();
      }
    };
  }, 10);
}

// ==================== GLOBAL EXPORTS & INITIALIZATION ====================
if (typeof window !== "undefined") {
  window.initializeHRSalaryPage = initializeHRSalaryPage;
  window.viewSalaryDetails = viewSalaryDetails;
  window.changeYear = changeYear;
  window.selectMonthYear = selectMonthYear;
  window.confirmMonthSelection = confirmMonthSelection;
  window.cancelMonthSelection = cancelMonthSelection;
  window.showDetailView = showDetailView;
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

// Also initialize when salary tab button is clicked (if you're using tab navigation)
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
