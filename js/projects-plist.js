/* ===================================
   PROJECTS-PLIST.JS - Project List Functionality
   With Backend API Integration
   =================================== */

// API Configuration
const API_BASE_URL_PROJECTS = 'https://www.fist-o.com/fisto_finance_app/api/project_list';

// Global variables
let projectCounter = 0;
let projectTeamMembers = [];

let selectedProjectTeamMembers = [];
let currentEditingRow = null;
let currentEditingProjectId = null;

// ===================================
// API FUNCTIONS
// ===================================

// Project Name Autocomplete
let projectNameInput;
let projectSuggestionsContainer;

function initProjectNameAutocomplete() {
  projectNameInput = document.getElementById('projectReportProjectName');
  projectSuggestionsContainer = document.getElementById('projectNameSuggestions');
  
  if (!projectNameInput) return;
  
  projectNameInput.addEventListener('input', handleProjectNameInput);
  
  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!projectNameInput.contains(e.target) && !projectSuggestionsContainer.contains(e.target)) {
      projectSuggestionsContainer.classList.remove('show');
    }
  });
}

async function handleProjectNameInput(e) {
  const query = e.target.value.trim();
  
  if (query.length < 2) {
    projectSuggestionsContainer.classList.remove('show');
    return;
  }
  
  try {
    const suggestions = await fetchProjectSuggestions(query);
    displayProjectSuggestions(suggestions);
  } catch (error) {
    console.error('Error fetching project suggestions:', error);
  }
}

async function fetchProjectSuggestions(query) {
  const resp = await fetch(`${API_BASE_URL_PROJECTS}/search_project_names.php?query=${encodeURIComponent(query)}`);
  const data = await resp.json();
  return data.success ? data.projects : [];
}

function displayProjectSuggestions(suggestions) {
  if (!suggestions || suggestions.length === 0) {
    projectSuggestionsContainer.classList.remove('show');
    return;
  }
  
  projectSuggestionsContainer.innerHTML = suggestions.map(proj => `
    <div class="autocomplete-suggestion-item" onclick="selectProject(${proj.lead_id}, '${escapeHtml(proj.project_name)}')">
      ${escapeHtml(proj.project_name)}
    </div>
  `).join('');
  
  projectSuggestionsContainer.classList.add('show');
}

async function selectProject(leadId, projectName) {
  // Set project name
  projectNameInput.value = projectName;
  
  // Hide suggestions
  projectSuggestionsContainer.classList.remove('show');
  
  // Fetch and auto-fill project details
  try {
    const resp = await fetch(`${API_BASE_URL_PROJECTS}/project_details.php?lead_id=${leadId}`);
    const data = await resp.json();
    
    if (data.success && data.projectDetails) {
      document.getElementById('projectReportCompanyName').value = data.projectDetails.company_name || '';
      document.getElementById('projectReportCategory').value = data.projectDetails.project_category || '';
      document.getElementById('projectReportStartDate').value = data.projectDetails.start_date || '';
      document.getElementById('projectReportCompletedDate').value = data.projectDetails.completion_date || '';
    }
  } catch (error) {
    console.error('Error fetching project details:', error);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


async function loadTeamMembers() {
  try {
    const response = await fetch(`${API_BASE_URL_PROJECTS}/get_team_members.php`);
    const result = await response.json();
    
    if (result.success && result.team_members && result.team_members.length > 0) {
      projectTeamMembers = result.team_members.map(member => ({
        employee_id: member.employee_id,
        name: member.employee_name,
        photo_url: member.photo_url,
        initial: member.employee_name.charAt(0).toUpperCase()
      }));
      console.log('✅ Team members loaded:', projectTeamMembers.length);
    } else {
      console.warn('⚠️ No team members found');
    }
  } catch (error) {
    console.error('❌ Error loading team members:', error);
  }
}

async function loadProjects() {
  try {
    const response = await fetch(`${API_BASE_URL_PROJECTS}/get_projects.php`);
    const result = await response.json();
    
    if (result.success) {
      const tbody = document.querySelector('.project-reports-table tbody');
      if (!tbody) return;
      
      tbody.innerHTML = '';
      
      if (result.projects.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="12" style="text-align: center; padding: 2rem; color: #64748b;">
              No project added yet. Click "Add project" to get started.
            </td>
          </tr>
        `;
        projectCounter = 0;
      } else {
        projectCounter = result.projects.length;
        result.projects.reverse().forEach((project) => {
          addProjectReportToTable(project, true);
        });
        console.log('✅ Projects loaded:', result.projects.length);
      }
    } else {
      console.error('❌ Failed to load projects:', result.message);
    }
  } catch (error) {
    console.error('❌ Error loading projects:', error);
  }
}

// ===================================
// MODAL FUNCTIONS
// ===================================

function openAddProjectModal() {
  console.log('Opening modal...');
  document.getElementById('addProjectModalOverlay').classList.add('active');
  resetAddProjectForm();
  renderProjectTeamMemberCheckboxes();
  initProjectNameAutocomplete();
}

function closeAddProjectModal() {
  document.getElementById('addProjectModalOverlay').classList.remove('active');
  resetAddProjectForm();
}

function closeAddProjectModalOnOverlay(event) {
  if (event.target === event.currentTarget) {
    closeAddProjectModal();
  }
}

function resetAddProjectForm() {
  document.getElementById('addProjectForm').reset();
  selectedProjectTeamMembers = [];
  updateProjectSelectedCount();
  updateSelectedMembersBadges();
  renderProjectTeamMemberCheckboxes();
  const dropdown = document.querySelector('.project-team-members-list');
  if (dropdown) {
    dropdown.classList.remove('active');
  }
}

// ===================================
// TEAM MEMBERS DROPDOWN
// ===================================

function toggleProjectTeamMembersDropdown() {
  const dropdown = document.querySelector('.project-team-members-list');
  const dropdownContainer = document.querySelector('.project-team-members-dropdown');

  dropdown.classList.toggle('active');
  dropdownContainer.classList.toggle('active');
}

function getPhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  
  // If already a full URL, return as is
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    // ✅ Add cache busting if not already present
    if (!photoUrl.includes('?v=')) {
      return photoUrl + '?v=' + Date.now();
    }
    return photoUrl;
  }
  
  // Otherwise, prepend base URL
  const timestamp = Date.now();
  return `https://www.fist-o.com/fisto_finance_app/${photoUrl}?v=${timestamp}`;
}

function renderProjectTeamMemberCheckboxes(containerId = 'projectTeamMembersList') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';

  projectTeamMembers.forEach(member => {
    if (!selectedProjectTeamMembers.includes(member.employee_id)) {
      const checkbox = document.createElement('label');
      checkbox.className = 'project-team-member-checkbox';
      
      const photoUrl = getPhotoUrl(member.photo_url);
      const photoHTML = photoUrl 
        ? `<img src="${photoUrl}" alt="${member.name}" class="member-photo">`
        : `<div class="member-initial">${member.initial}</div>`;
      
      checkbox.innerHTML = `
        <input 
          type="checkbox" 
          value="${member.employee_id}" 
          onchange="handleProjectTeamMemberSelect('${member.employee_id}', this.checked)"
        >
        ${photoHTML}
        <span>${member.name}</span>
      `;
      container.appendChild(checkbox);
    }
  });
}


function handleProjectTeamMemberSelect(employeeId, isChecked) {
  if (isChecked) {
    const member = projectTeamMembers.find(m => m.employee_id === employeeId);
    if (member && !selectedProjectTeamMembers.includes(employeeId)) {
      selectedProjectTeamMembers.push(employeeId);
    }
  } else {
    selectedProjectTeamMembers = selectedProjectTeamMembers.filter(id => id !== employeeId);
  }
  updateProjectSelectedCount();
  updateSelectedMembersBadges();
  renderProjectTeamMemberCheckboxes();
  renderProjectTeamMemberCheckboxes('editTeamMembersList');
}

function updateProjectSelectedCount(countElementId = 'projectSelectedMembersCount') {
  const countElement = document.getElementById(countElementId);
  if (!countElement) return;
  
  if (selectedProjectTeamMembers.length > 0) {
    countElement.textContent = `${selectedProjectTeamMembers.length} selected`;
    countElement.style.display = 'inline';
  } else {
    countElement.style.display = 'none';
  }
}

function updateSelectedMembersBadges(badgesContainerId = 'selectedMembersBadges') {
  const badgesContainer = document.getElementById(badgesContainerId);
  if (!badgesContainer) return;

  badgesContainer.innerHTML = '';

  selectedProjectTeamMembers.forEach(employeeId => {
    const member = projectTeamMembers.find(m => m.employee_id === employeeId);
    if (member) {
      const badge = document.createElement('div');
      badge.className = 'selected-member-badge';
      
      const photoUrl = getPhotoUrl(member.photo_url);
      const photoHTML = photoUrl 
        ? `<img src="${photoUrl}" alt="${member.name}" class="badge-photo">`
        : `<div class="badge-initial">${member.initial}</div>`;
      
      badge.innerHTML = `
        ${photoHTML}
        <span class="badge-text">${member.name}</span>
        <button type="button" class="badge-remove-btn" onclick="removeSelectedMember('${member.employee_id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      badgesContainer.appendChild(badge);
    }
  });
}

function removeSelectedMember(employeeId) {
  selectedProjectTeamMembers = selectedProjectTeamMembers.filter(id => id !== employeeId);
  updateProjectSelectedCount();
  updateProjectSelectedCount('editSelectedMembersCount');
  updateSelectedMembersBadges();
  updateSelectedMembersBadges('editSelectedMembersBadges');
  renderProjectTeamMemberCheckboxes();
  renderProjectTeamMemberCheckboxes('editTeamMembersList');
}

// ===================================
// SAVE PROJECT REPORT
// ===================================

async function saveProjectReport() {
  const year = document.getElementById('projectReportYear').value;
  const month = document.getElementById('projectReportMonth').value;
  const companyName = document.getElementById('projectReportCompanyName').value;
  const projectName = document.getElementById('projectReportProjectName').value;
  const projectCategory = document.getElementById('projectReportCategory').value;
  const startDate = document.getElementById('projectReportStartDate').value;
  const completedDate = document.getElementById('projectReportCompletedDate').value;
  const liveLink = document.getElementById('projectReportLiveLink').value;
  const status = document.getElementById('projectReportStatus').value;

  if (!year || !month) {
    CommonModal.error('Please select both year and month', 'Validation Error');
    return;
  }

  if (!companyName || companyName.trim().length < 2) {
    CommonModal.error('Please enter a valid company name (at least 2 characters)', 'Validation Error');
    return;
  }

  if (!projectName || projectName.trim().length < 3) {
    CommonModal.error('Please enter a valid project name (at least 3 characters)', 'Validation Error');
    return;
  }

  if (!projectCategory) {
    CommonModal.error('Please select a project category', 'Validation Error');
    return;
  }

  if (!startDate) {
    CommonModal.error('Please select a start date', 'Validation Error');
    return;
  }

  if (!completedDate) {
    CommonModal.error('Please select a completion date', 'Validation Error');
    return;
  }

  const start = new Date(startDate);
  const completed = new Date(completedDate);

  if (completed < start) {
    CommonModal.error('Completion date cannot be before start date', 'Invalid Date');
    return;
  }

  if (selectedProjectTeamMembers.length === 0) {
    CommonModal.error('Please select at least one team member', 'Validation Error');
    return;
  }

  if (liveLink && liveLink.trim()) {
    try {
      new URL(liveLink);
    } catch (e) {
      CommonModal.error('Please enter a valid URL for the live link', 'Invalid URL');
      return;
    }
  }

  if (!status) {
    CommonModal.error('Please select a project status', 'Validation Error');
    return;
  }

  const projectData = {
    companyName: companyName.trim(),
    projectName: projectName.trim(),
    category: projectCategory,
    startDate: startDate,
    completedDate: completedDate,
    liveLink: liveLink.trim() || null,
    status: status.trim(),
    teamMembers: selectedProjectTeamMembers
  };

  const saveBtn = document.getElementById('saveBtn');
  const originalText = saveBtn ? saveBtn.textContent : 'Save';
  if (saveBtn) {
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
  }

  try {
    const response = await fetch(`${API_BASE_URL_PROJECTS}/create_project.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    });

    const result = await response.json();

    if (result.success) {
      CommonModal.success(`Project "${projectName}" added successfully!`, 'Success');
      closeAddProjectModal();
      loadProjects();
    } else {
      CommonModal.error(result.message || 'Failed to create project', 'Error');
    }
  } catch (error) {
    console.error('Error saving project:', error);
    CommonModal.error('Failed to connect to server', 'Connection Error');
  } finally {
    if (saveBtn) {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
  }
}

function getMonthShortName(monthIndex) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return months[monthIndex];
}

// ===================================
// ADD PROJECT TO TABLE
// ===================================
function debugProjectData(project) {
  console.log('=== PROJECT DEBUG ===');
  console.log('Project Name:', project.projectName);
  console.log('Team Members:', project.teamMembers);
  console.log('Employees:', project.employees);
  console.log('Employees Length:', project.employees ? project.employees.length : 'NULL');
  if (project.employees && project.employees.length > 0) {
    console.log('First Employee:', project.employees[0]);
  }
}


function addProjectReportToTable(project, fromDatabase = false) {
  debugProjectData(project);
  const tbody = document.querySelector('.project-reports-table tbody');
  if (!tbody) return;

  if (tbody.querySelector('td[colspan]')) {
    tbody.innerHTML = '';
  }

  if (!fromDatabase) {
    projectCounter++;
  }
  
  const row = tbody.insertRow();

  const projectDataToStore = {
    id: project.id || null,
    date: project.date || new Date().toLocaleDateString('en-GB'),
    companyName: project.companyName,
    projectName: project.projectName,
    category: project.category,
    teamMembers: project.teamMembers || [],
    employees: project.employees || [],
    startDate: project.startDate,
    completedDate: project.completedDate,
    liveLink: project.liveLink,
    status: project.status
  };

  row.dataset.projectData = JSON.stringify(projectDataToStore);

  const teamMembersHTML = createProjectTeamMembersDisplay(project.teamMembers, project.employees);

  const serialNumber = tbody.rows.length;

  row.innerHTML = `
    <td>${String(serialNumber).padStart(2, '0')}</td>
    <td>${project.date}</td>
    <td>${project.companyName}</td>
    <td>${project.projectName}</td>
    <td>${project.category}</td>
    <td>${teamMembersHTML}</td>
    <td>${formatProjectDate(project.startDate)}</td>
    <td>${formatProjectDate(project.completedDate)}</td>
    <td>
      ${project.liveLink ? `<a href="${project.liveLink}" class="project-live-link" target="_blank" rel="noopener noreferrer">Live Link</a>` : '-'}
    </td>
    <td>${project.status}</td>
    <td><button class="view-edit-btn" onclick="openEditModal(this)"><img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon"></button></td>
    <td><button class="delete-btn" onclick="deleteProjectRow(this)"><img src="/FISTO_FINANCE/assets/images/tabler_delete_icon.webp" alt="delete icon"></button></td>
  `;
}

function createProjectTeamMembersDisplay(employeeIds, employees) {
    // Debug log
  console.log('createProjectTeamMembersDisplay called with:', {
    employeeIds,
    employees,
    employeesLength: employees ? employees.length : 0
  });
  if (!employees || employees.length === 0) return '-';
  
  const visibleMembers = employees.slice(0, 3);
  const remainingCount = employees.length - 3;
  const allMemberNames = employees.map(m => m.employee_name).join('\n');
  
  let html = '<div class="project-team-avatars">';
  
  visibleMembers.forEach(member => {
    const photoUrl = getPhotoUrl(member.photo_url);
    if (photoUrl) {
      html += `
        <div class="project-team-avatar-img" title="${member.employee_name}">
          <img src="${photoUrl}" alt="${member.employee_name}">
        </div>
      `;
    } else {
      const initial = member.employee_name.charAt(0).toUpperCase();
      const color = getColorForInitial(initial);
      html += `
        <div class="project-team-avatar" style="background: ${color}" title="${member.employee_name}">
          ${initial}
        </div>
      `;
    }
  });
  
  if (remainingCount > 0) {
    html += `
      <div class="project-team-avatar-more"
        data-members="${allMemberNames}"
        onmouseenter="showTeamTooltip(this)" 
        onmouseleave="hideTeamTooltip()"
      >+${remainingCount} more</div>
    `;
  }
  
  html += '</div>';
  return html;
}

function getColorForInitial(initial) {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
  const index = initial.charCodeAt(0) % colors.length;
  return colors[index];
}

let tooltipDiv = null;
function showTeamTooltip(el) {
  hideTeamTooltip();
  tooltipDiv = document.createElement('div');
  tooltipDiv.className = 'custom-team-tooltip';
  tooltipDiv.innerText = el.getAttribute('data-members') || '';
  document.body.appendChild(tooltipDiv);
  const rect = el.getBoundingClientRect();
  requestAnimationFrame(() => {
    tooltipDiv.style.position = 'fixed';
    tooltipDiv.style.left = (rect.left + rect.width/2 - tooltipDiv.offsetWidth/2) + 'px';
    tooltipDiv.style.top = (rect.top - tooltipDiv.offsetHeight - 8) + 'px';
    tooltipDiv.style.opacity = '1';
  });
}
function hideTeamTooltip() {
  if (tooltipDiv) {
    tooltipDiv.remove();
    tooltipDiv = null;
  }
}


function formatProjectDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = getMonthShortName(date.getMonth());
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// ===================================
// CREATE EDIT MODAL DYNAMICALLY
// ===================================

function createEditModal() {
  if (document.getElementById('dynamicEditModal')) {
    return;
  }

  const modalHTML = `
    <div class="modal-overlay" id="dynamicEditModal" onclick="closeEditModalOnOverlay(event)">
      <div class="modal add-project-modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Edit Project</h2>
          <button class="close-btn" onclick="closeEditModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body modal-scrollable-project">
          <form id="editProjectForm">
            <div class="form-row">
            <div class="form-group">
              <label class="form-label">Project Name</label>
              <input type="text" class="form-input" id="editProjectName" placeholder="Project Name" required />
            </div>
              <div class="form-group">
                <label class="form-label">Company Name</label>
                <input type="text" class="form-input" id="editCompanyName" placeholder="Company Name" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Project Category</label>
                <input type="text" class="form-input" id="editCategory" placeholder="Project Category" required />
              </div>
              <div class="form-group">
                <label class="form-label">
                  Team Members
                  <span id="editSelectedMembersCount" class="project-selected-count" style="display: none;"></span>
                </label>
                <div class="project-team-members-dropdown" id="editDropdownContainer">
                  <button type="button" class="form-select dropdown-trigger" onclick="toggleEditTeamMembersDropdown()">
                    Select Team Members
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div class="project-team-members-list" id="editTeamMembersList"></div>
                </div>
                <div id="editSelectedMembersBadges" class="selected-members-badges"></div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="date" class="form-input" id="editStartDate" required />
              </div>
              <div class="form-group">
                <label class="form-label">Completed Date</label>
                <input type="date" class="form-input" id="editCompletedDate" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Live Link</label>
                <input type="url" class="form-input" id="editLiveLink" placeholder="Paste Your Link" />
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="editStatus" required>
                  <option value="">Enter Project Status</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Hold">Hold</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary" onclick="saveEditedProject()">Update</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function toggleEditTeamMembersDropdown() {
  const dropdown = document.getElementById('editTeamMembersList');
  const dropdownContainer = document.getElementById('editDropdownContainer');

  dropdown.classList.toggle('active');
  dropdownContainer.classList.toggle('active');
}

function closeEditModalOnOverlay(event) {
  if (event.target === event.currentTarget) {
    closeEditModal();
  }
}

// ===================================
// VIEW/EDIT FUNCTIONALITY
// ===================================

function openEditModal(button) {
  const row = button.closest('tr');
  if (!row) return;

  createEditModal();
  currentEditingRow = row;

  const projectData = JSON.parse(row.dataset.projectData);
  currentEditingProjectId = projectData.id;

  document.getElementById('editCompanyName').value = projectData.companyName;
  document.getElementById('editProjectName').value = projectData.projectName;
  document.getElementById('editCategory').value = projectData.category;
  document.getElementById('editStartDate').value = projectData.startDate;
  document.getElementById('editCompletedDate').value = projectData.completedDate;
  document.getElementById('editLiveLink').value = projectData.liveLink || '';
  document.getElementById('editStatus').value = projectData.status;

  selectedProjectTeamMembers = [...projectData.teamMembers];
  updateProjectSelectedCount('editSelectedMembersCount');
  updateSelectedMembersBadges('editSelectedMembersBadges');
  renderProjectTeamMemberCheckboxes('editTeamMembersList');

  document.getElementById('dynamicEditModal').classList.add('active');
}

function closeEditModal() {
  const modal = document.getElementById('dynamicEditModal');
  if (modal) {
    modal.classList.remove('active');
  }
  currentEditingRow = null;
  currentEditingProjectId = null;
  selectedProjectTeamMembers = [];
}

async function saveEditedProject() {
  if (!currentEditingRow || !currentEditingProjectId) return;

  const companyName = document.getElementById('editCompanyName').value;
  const projectName = document.getElementById('editProjectName').value;
  const category = document.getElementById('editCategory').value;
  const startDate = document.getElementById('editStartDate').value;
  const completedDate = document.getElementById('editCompletedDate').value;
  const liveLink = document.getElementById('editLiveLink').value;
  const status = document.getElementById('editStatus').value;

  if (!companyName || companyName.trim().length < 2) {
    CommonModal.error('Please enter a valid company name', 'Validation Error');
    return;
  }

  if (!projectName || projectName.trim().length < 3) {
    CommonModal.error('Please enter a valid project name', 'Validation Error');
    return;
  }

  if (!category) {
    CommonModal.error('Please select a project category', 'Validation Error');
    return;
  }

  if (!startDate || !completedDate) {
    CommonModal.error('Please select both start and completion dates', 'Validation Error');
    return;
  }

  const start = new Date(startDate);
  const completed = new Date(completedDate);

  if (completed < start) {
    CommonModal.error('Completion date cannot be before start date', 'Invalid Date');
    return;
  }

  if (selectedProjectTeamMembers.length === 0) {
    CommonModal.error('Please select at least one team member', 'Validation Error');
    return;
  }

  if (liveLink && liveLink.trim()) {
    try {
      new URL(liveLink);
    } catch (e) {
      CommonModal.error('Please enter a valid URL', 'Invalid URL');
      return;
    }
  }

  if (!status) {
    CommonModal.error('Please enter a project status', 'Validation Error');
    return;
  }

  const updatedData = {
    id: currentEditingProjectId,
    companyName: companyName.trim(),
    projectName: projectName.trim(),
    category: category,
    startDate: startDate,
    completedDate: completedDate,
    liveLink: liveLink.trim() || null,
    status: status.trim(),
    teamMembers: selectedProjectTeamMembers
  };

  try {
    const response = await fetch(`${API_BASE_URL_PROJECTS}/update_project.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });

    const result = await response.json();

    if (result.success) {
      CommonModal.success(`Project "${projectName}" updated successfully!`, 'Project Updated');
      closeEditModal();
      loadProjects();
    } else {
      CommonModal.error(result.message || 'Failed to update project', 'Error');
    }
  } catch (error) {
    console.error('Error updating project:', error);
    CommonModal.error('Failed to connect to server', 'Connection Error');
  }
}

// ===================================
// DELETE FUNCTIONALITY
// ===================================

function deleteProjectRow(button) {
  const row = button.closest('tr');
  if (!row) return;

  const projectData = JSON.parse(row.dataset.projectData);
  const projectName = projectData.projectName;
  const projectId = projectData.id;

  if (!projectId) {
    CommonModal.error('Cannot delete project: Invalid project ID', 'Error');
    return;
  }

  CommonModal.confirm(
    `Are you sure you want to delete the project "${projectName}"? This action cannot be undone.`,
    'Delete Project',
    async function() {
      try {
        const response = await fetch(`${API_BASE_URL_PROJECTS}/delete_project.php`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: projectId })
        });

        const result = await response.json();

        if (result.success) {
          CommonModal.success(`Project "${projectName}" deleted successfully!`, 'Project Deleted');
          loadProjects();
        } else {
          CommonModal.error(result.message || 'Failed to delete project', 'Error');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        CommonModal.error('Failed to connect to server', 'Connection Error');
      }
    }
  );
}

// ===================================
// INITIALIZE
// ===================================

document.addEventListener('DOMContentLoaded', function() {
  loadTeamMembers();
  loadProjects();
  console.log('🚀 Project List loaded!');
});

document.addEventListener('mousedown', function(event) {
  // Check for any open dropdown
  document.querySelectorAll('.project-team-members-dropdown.active').forEach(function(container) {
    // If the click is outside the container (including all children!)
    if (!container.contains(event.target)) {
      container.classList.remove('active');
      const dropdown = container.querySelector('.project-team-members-list');
      if (dropdown) dropdown.classList.remove('active');
    }
  });
});
