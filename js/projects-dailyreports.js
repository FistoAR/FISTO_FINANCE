/* ===================================
   PROJECTS-DAILYREPORTS.JS - Daily Reports Functionality
   WITH BACKEND INTEGRATION & DYNAMIC EMPLOYEES & PHOTOS
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
  
  const API_BASE = 'https://www.fist-o.com/fisto_finance_app/api/daily_reports';
  const dailyReportsContainer = document.getElementById('dailyReportsContainer');

  if (!dailyReportsContainer) return;

  // This will be populated from the database
  let employees = [];

  // ===================================
  // FETCH EMPLOYEES FROM DATABASE
  // ===================================
  
  async function loadEmployees() {
    try {
      const response = await fetch(`${API_BASE}/get_employees.php`);
      const result = await response.json();

      if (result.success && result.employees) {
        employees = result.employees;
        console.log('✅ Loaded employees from database:', employees.length);
        console.log('Employees data:', employees);
        
        // After loading employees, initialize the reports
        initializeDailyReports();
      } else {
        throw new Error('Failed to load employees');
      }
    } catch (error) {
      console.error('❌ Error loading employees:', error);
      CommonModal.error('Failed to load employees from database', 'Error');
    }
  }

  // Function to generate dates (today and previous 6 days)
  function generateDates() {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }

    return dates;
  }

  // Function to format date as "31-10-2025"
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Function to load saved data for a specific date
  async function loadReportData(dateStr, card) {
    try {
      const response = await fetch(`${API_BASE}/get_report.php?date=${dateStr}`);
      const result = await response.json();

      if (result.success && result.reports.length > 0) {
        // Fill the inputs with saved data
        result.reports.forEach(report => {
          const todayInput = card.querySelector(`input[data-employee="${report.employee_id}"][data-type="today"]`);
          const completedInput = card.querySelector(`input[data-employee="${report.employee_id}"][data-type="completed"]`);
          const percentageInput = card.querySelector(`input[data-employee="${report.employee_id}"][data-type="percentage"]`);
          const linkInput = card.querySelector(`input[data-employee="${report.employee_id}"][data-type="link"]`);

          if (todayInput && report.today_task) todayInput.value = report.today_task;
          if (completedInput && report.completed_task) completedInput.value = report.completed_task;
          if (percentageInput && report.completion_percentage) percentageInput.value = report.completion_percentage;
          if (linkInput && report.task_link) linkInput.value = report.task_link;
        });

        console.log(`✅ Loaded ${result.reports.length} reports for ${dateStr}`);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    }
  }

  // ✅ Function to create avatar HTML (with photo or initial)
  function createEmployeeAvatar(emp) {
    if (emp.photo) {
      // Has photo - show image
      return `
        <div class="employee-avatar">
          <img src="${emp.photo}" 
               alt="${emp.name}" 
               onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'background: ${emp.color}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;\\'>${emp.avatar}</div>';">
        </div>
      `;
    } else {
      // No photo - show initial with colored background
      return `
        <div class="employee-avatar" style="background: ${emp.color}">
          ${emp.avatar}
        </div>
      `;
    }
  }

  // Function to create a report card with timeline number
  function createReportCard(date, index) {
    const dateStr = formatDate(date);
    const isToday = index === 0;
    const displayNumber = String(index + 1).padStart(2, '0');

    const wrapper = document.createElement('div');
    wrapper.className = 'report-card-wrapper';

    const timelineNumber = document.createElement('div');
    timelineNumber.className = 'timeline-number';
    timelineNumber.textContent = displayNumber;

    const connectorLine = document.createElement('div');
    connectorLine.className = 'timeline-connector';

    const card = document.createElement('div');
    card.className = 'report-card';
    card.setAttribute('data-date', dateStr);

    // ✅ Now using employees with photos from database
    card.innerHTML = `
      <div class="report-header">
        <div class="report-header-left">
          <div class="report-info">
            <div class="report-title">${isToday ? "Today's Tasks" : 'Tasks'}</div>
            <div class="report-date">${dateStr}</div>
          </div>
        </div>
        <div class="report-toggle">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      <div class="report-content">
        <div class="tasks-table-wrapper">
          <table class="tasks-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Today's Task</th>
                <th>Completed Task</th>
                <th>Complete %</th>
                <th>Links</th>
              </tr>
            </thead>
            <tbody>
              ${employees.length === 0 ? 
                '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">No employees found</td></tr>' :
                employees.map(emp => `
                  <tr>
                    <td class="employee-id">${emp.id}</td>
                    <td>
                      <div class="employee-name">
                        ${createEmployeeAvatar(emp)}
                        <span class="employee-name-text">${emp.name}</span>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        class="task-input" 
                        placeholder="Enter Today's Task"
                        data-employee="${emp.id}"
                        data-date="${dateStr}"
                        data-type="today"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        class="task-input" 
                        placeholder="Enter Completed Task"
                        data-employee="${emp.id}"
                        data-date="${dateStr}"
                        data-type="completed"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        class="task-input percentage-input" 
                        placeholder="%"
                        data-employee="${emp.id}"
                        data-date="${dateStr}"
                        data-type="percentage"
                        maxlength="3"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        class="task-input" 
                        placeholder="Enter Link"
                        data-employee="${emp.id}"
                        data-date="${dateStr}"
                        data-type="link"
                      />
                    </td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>

          <div class="save-button-wrapper">
            <button class="save-btn" data-date="${dateStr}">Save</button>
          </div>
        </div>
      </div>
    `;

    wrapper.appendChild(timelineNumber);
    wrapper.appendChild(connectorLine);
    wrapper.appendChild(card);

    // Load saved data for this date
    loadReportData(dateStr, card);

    return wrapper;
  }

  // Generate and append report cards
  function initializeDailyReports() {
    // Clear container first
    dailyReportsContainer.innerHTML = '';
    
    const dates = generateDates();

    dates.forEach((date, index) => {
      const wrapper = createReportCard(date, index);
      dailyReportsContainer.appendChild(wrapper);
    });

    // First card is open, others collapsed
    const allCards = dailyReportsContainer.querySelectorAll('.report-card');
    allCards.forEach((card, idx) => {
      if (idx > 0) {
        card.classList.add('collapsed');
      }
    });
    
    console.log('✅ Daily reports initialized with', employees.length, 'employees');
  }

  // Collapse/expand functionality
  dailyReportsContainer.addEventListener('click', function(e) {
    const header = e.target.closest('.report-header');
    if (header) {
      const card = header.closest('.report-card');
      card.classList.toggle('collapsed');
    }
  });

  // Percentage input validation
  dailyReportsContainer.addEventListener('input', function(e) {
    if (e.target.classList.contains('percentage-input')) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      if (parseInt(e.target.value) > 100) {
        e.target.value = '100';
      }
    }
  });

  // Save button functionality
  dailyReportsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('save-btn')) {
      const date = e.target.getAttribute('data-date');
      const card = e.target.closest('.report-card');
      const inputs = card.querySelectorAll('.task-input');

      const tasksData = [];
      let hasData = false;

      inputs.forEach(input => {
        const employeeId = input.getAttribute('data-employee');
        const type = input.getAttribute('data-type');
        const value = input.value.trim();

        if (value) {
          hasData = true;
          tasksData.push({
            employee: employeeId,
            date: date,
            type: type,
            value: value
          });
        }
      });

      if (!hasData) {
        CommonModal.error('Please enter at least one task before saving', 'No Data');
        return;
      }

      // Save to backend
      saveTasksData(date, tasksData, e.target);
    }
  });

  // Save function with backend integration
  async function saveTasksData(date, tasksData, saveButton) {
    console.log('Saving tasks for date:', date);
    console.log('Tasks data:', tasksData);

    const originalText = saveButton.textContent;
    saveButton.textContent = 'Saving...';
    saveButton.disabled = true;

    try {
      const response = await fetch(`${API_BASE}/save_report.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: date,
          tasks: tasksData
        })
      });

      const result = await response.json();

      if (result.success) {
        CommonModal.success(`Daily tasks saved successfully for ${date}!`);
        
        saveButton.textContent = '✓ Saved';
        saveButton.style.background = '#10b981';

        setTimeout(() => {
          saveButton.textContent = originalText;
          saveButton.style.background = '';
          saveButton.disabled = false;
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      CommonModal.error('Failed to save tasks: ' + error.message, 'Save Error');
      
      saveButton.textContent = originalText;
      saveButton.disabled = false;
    }
  }

  // ✅ START BY LOADING EMPLOYEES FIRST
  loadEmployees();

  console.log('✅ Daily Reports module loaded!');
});
