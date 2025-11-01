/* ===================================
   PROJECTS.JS - Projects Page Functionality
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
  
  // ===================================
  // TAB SWITCHING
  // ===================================
  
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');

      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked tab
      this.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // ===================================
  // GENERATE DAILY REPORTS
  // ===================================

  const dailyReportsContainer = document.getElementById('dailyReportsContainer');

  // Sample employee data - replace with your actual data
  const employees = [
    { id: 'FSTINT101', name: 'RENGOKU', avatar: 'R', color: '#6366f1' },
    { id: 'FSTINT0925', name: 'PRIYA', avatar: 'P', color: '#8b5cf6' },
    { id: 'FSTINT101', name: 'SAMEER', avatar: 'S', color: '#ec4899' },
    { id: 'FSTINT0925', name: 'MURUGAN', avatar: 'M', color: '#f43f5e' },
    { id: 'FSTINT101', name: 'SAMEER', avatar: 'S', color: '#ef4444' },
  ];

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

  // Function to create a report card with timeline number
  function createReportCard(date, index) {
    const dateStr = formatDate(date);
    const isToday = index === 0;
    const displayNumber = String(index + 1).padStart(2, '0');

    // Create wrapper for card and number
    const wrapper = document.createElement('div');
    wrapper.className = 'report-card-wrapper';

    // Create the timeline number
    const timelineNumber = document.createElement('div');
    timelineNumber.className = 'timeline-number';
    timelineNumber.textContent = displayNumber;

    // Create the connector line
    const connectorLine = document.createElement('div');
    connectorLine.className = 'timeline-connector';

    // Create the card
    const card = document.createElement('div');
    card.className = 'report-card';
    
    card.innerHTML = `
      <div class="report-header">
        <div class="report-header-left">
          <div class="report-info">
            <div class="report-title">Todays Tasks</div>
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
                <th>Todays Task</th>
                <th>Completed Task</th>
                <th>Complete Percentage %</th>
                <th>Links</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => `
                <tr>
                  <td class="employee-id">${emp.id}</td>
                  <td>
                    <div class="employee-name">
                      <div class="employee-avatar" style="background: ${emp.color}">
                        ${emp.avatar}
                      </div>
                      <span class="employee-name-text">${emp.name}</span>
                    </div>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      class="task-input" 
                      placeholder="Enter Todays Task"
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
                      placeholder="Enter Percentage%"
                      data-employee="${emp.id}"
                      data-date="${dateStr}"
                      data-type="percentage"
                      maxlength="3"
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      class="task-input percentage-input" 
                      placeholder="Enter Link"
                      data-employee="${emp.id}"
                      data-date="${dateStr}"
                      data-type="percentage"
                      maxlength="3"
                    />
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Save Button -->
          <div class="save-button-wrapper">
            <button class="save-btn" data-date="${dateStr}">Save</button>
          </div>
        </div>
      </div>
    `;

    // Assemble the wrapper
    wrapper.appendChild(timelineNumber);
    wrapper.appendChild(connectorLine);
    wrapper.appendChild(card);

    return wrapper;
  }

  // Generate and append report cards
  function initializeDailyReports() {
    const dates = generateDates();
    
    dates.forEach((date, index) => {
      const wrapper = createReportCard(date, index);
      dailyReportsContainer.appendChild(wrapper);
    });

    // First card is open by default
    const firstCard = dailyReportsContainer.querySelector('.report-card');
    if (firstCard) {
      // All other cards start collapsed
      const allCards = dailyReportsContainer.querySelectorAll('.report-card');
      allCards.forEach((card, idx) => {
        if (idx > 0) {
          card.classList.add('collapsed');
        }
      });
    }
  }

  // Initialize reports
  initializeDailyReports();

  // ===================================
  // COLLAPSE/EXPAND FUNCTIONALITY
  // ===================================

  dailyReportsContainer.addEventListener('click', function(e) {
    const header = e.target.closest('.report-header');
    if (header) {
      const card = header.closest('.report-card');
      card.classList.toggle('collapsed');
    }
  });

  // ===================================
  // PERCENTAGE INPUT VALIDATION
  // ===================================

  dailyReportsContainer.addEventListener('input', function(e) {
    if (e.target.classList.contains('percentage-input')) {
      // Only allow numbers
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      
      // Limit to 100
      if (parseInt(e.target.value) > 100) {
        e.target.value = '100';
      }
    }
  });

  // ===================================
  // SAVE BUTTON FUNCTIONALITY
  // ===================================

  dailyReportsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('save-btn')) {
      const date = e.target.getAttribute('data-date');
      const card = e.target.closest('.report-card');
      const inputs = card.querySelectorAll('.task-input');
      
      const tasksData = [];
      
      inputs.forEach(input => {
        const employeeId = input.getAttribute('data-employee');
        const type = input.getAttribute('data-type');
        const value = input.value;
        
        if (value) { // Only save if there's a value
          tasksData.push({
            employee: employeeId,
            date: date,
            type: type,
            value: value
          });
        }
      });

      console.log('Saving tasks for date:', date);
      console.log('Tasks data:', tasksData);

      // Show success message
      e.target.textContent = 'Saved!';
      e.target.style.background = '#10b981';
      
      setTimeout(() => {
        e.target.textContent = 'Save';
        e.target.style.background = '';
      }, 2000);

      // Here you would send this data to your backend
      // Example: 
      // fetch('/api/save-tasks', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ date: date, tasks: tasksData })
      // });
    }
  });

  // ===================================
  // FIGMA LINK CLICK HANDLER
  // ===================================

  dailyReportsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('figma-link')) {
      e.preventDefault();
      const employeeId = e.target.getAttribute('data-employee');
      console.log('Figma link clicked for employee:', employeeId);
      
      // Add your Figma link logic here
      // Example: window.open('https://figma.com/...', '_blank');
    }
  });

  console.log('Projects.js loaded successfully!');
});
