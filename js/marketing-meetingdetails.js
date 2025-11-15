// Store meetings data
let meetings = [];
let scheduleSelectedAttendees = [];
let momSelectedAttendees = [];

// Toggle meeting mode (Remote/Onsite)
function toggleMeetingMode() {
  const isRemote = document.getElementById("modeRemote").checked;
  document.getElementById("remoteLinkSection").style.display = isRemote ? "block" : "none";
  document.getElementById("onsiteAddressSection").style.display = isRemote ? "none" : "block";
}

// Add meeting link
function addMeetingLink() {
  const container = document.getElementById("meetingLinksContainer");
  const linkDiv = document.createElement("div");
  linkDiv.style.cssText = "display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;";
  linkDiv.innerHTML = `
    <input type="url" class="meeting-link-input" placeholder="https://example.com" style="flex: 1; width: 100%; padding: 0.75vw 1.2vw; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 0.85vw;">
    <button type="button" onclick="this.parentElement.remove()" style="background: #FEE2E2; color: #DC2626; border: none; padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; font-weight: 600;">Remove</button>
  `;
  container.appendChild(linkDiv);
}

// Schedule Meeting Attendees Dropdown
function toggleScheduleDropdown() {
  const dropdown = document.getElementById("scheduleAttendeesMenu");
  const button = document.getElementById("scheduleAttendeesDropdown");
  dropdown.classList.toggle("active");
  button.classList.toggle("active");
}

function selectScheduleAttendee(employeeId) {
  if (!scheduleSelectedAttendees.includes(employeeId)) {
    scheduleSelectedAttendees.push(employeeId);
    renderScheduleAttendeeTags();
    updateScheduleDropdownVisibility();
  }
  // Close dropdown
  document.getElementById("scheduleAttendeesMenu").classList.remove("active");
  document.getElementById("scheduleAttendeesDropdown").classList.remove("active");
}

function removeScheduleAttendee(employeeId) {
  scheduleSelectedAttendees = scheduleSelectedAttendees.filter(id => id !== employeeId);
  renderScheduleAttendeeTags();
  updateScheduleDropdownVisibility();
}

function updateScheduleDropdownVisibility() {
  const dropdownItems = document.querySelectorAll('#scheduleAttendeesMenu .dropdown-item');
  dropdownItems.forEach(item => {
    const employeeId = item.getAttribute('onclick').match(/'([^']+)'/)[1];
    if (scheduleSelectedAttendees.includes(employeeId)) {
      item.style.display = 'none';
    } else {
      item.style.display = 'flex';
    }
  });
}

function renderScheduleAttendeeTags() {
  const container = document.getElementById("scheduleAttendeeTags");
  if (scheduleSelectedAttendees.length === 0) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = scheduleSelectedAttendees.map(attendee => `
    <div class="attendee-tag">
      <span>${attendee}</span>
      <button class="attendee-tag-remove" onclick="removeScheduleAttendee('${attendee}')" type="button">&times;</button>
    </div>
  `).join("");
}

// MOM Attendees Dropdown
function toggleMomDropdown() {
  const dropdown = document.getElementById("momAttendeesMenu");
  const button = document.getElementById("momAttendeesDropdown");
  dropdown.classList.toggle("active");
  button.classList.toggle("active");
}

function selectMomAttendee(employeeId) {
  if (!momSelectedAttendees.includes(employeeId)) {
    momSelectedAttendees.push(employeeId);
    renderMomAttendeeTags();
    updateMomDropdownVisibility();
  }
  // Close dropdown
  document.getElementById("momAttendeesMenu").classList.remove("active");
  document.getElementById("momAttendeesDropdown").classList.remove("active");
}

function removeMomAttendee(employeeId) {
  momSelectedAttendees = momSelectedAttendees.filter(id => id !== employeeId);
  renderMomAttendeeTags();
  updateMomDropdownVisibility();
}

function updateMomDropdownVisibility() {
  const dropdownItems = document.querySelectorAll('#momAttendeesMenu .dropdown-item');
  dropdownItems.forEach(item => {
    const employeeId = item.getAttribute('onclick').match(/'([^']+)'/)[1];
    if (momSelectedAttendees.includes(employeeId)) {
      item.style.display = 'none';
    } else {
      item.style.display = 'flex';
    }
  });
}

function renderMomAttendeeTags() {
  const container = document.getElementById("momAttendeeTags");
  if (momSelectedAttendees.length === 0) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = momSelectedAttendees.map(attendee => `
    <div class="attendee-tag">
      <span>${attendee}</span>
      <button class="attendee-tag-remove" onclick="removeMomAttendee('${attendee}')" type="button">&times;</button>
    </div>
  `).join("");
}

// Schedule Meeting Modal
function openScheduleMeetingModal() {
  document.getElementById("scheduleMeetingModal").classList.add("active");
  document.getElementById("scheduleMeetingModal").style.display = "flex";
  scheduleSelectedAttendees = [];
  renderScheduleAttendeeTags();
  updateScheduleDropdownVisibility();
}

function closeScheduleMeetingModal() {
  document.getElementById("scheduleMeetingModal").classList.remove("active");
  document.getElementById("scheduleMeetingModal").style.display = "none";
  document.getElementById("scheduleMeetingForm").reset();
  document.getElementById("modeRemote").checked = true;
  toggleMeetingMode();
  scheduleSelectedAttendees = [];
  renderScheduleAttendeeTags();
  updateScheduleDropdownVisibility();
  const container = document.getElementById("meetingLinksContainer");
  container.innerHTML = '<input type="url" class="meeting-link-input" placeholder="https://example.com" style="width: 100%; padding: 0.75vw 1.2vw; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 0.85vw; margin-bottom: 0.5rem;" />';
}

// Handle Schedule Meeting Form Submit
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("scheduleMeetingForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // ✅ REPLACED: alert with CommonModal
    if (scheduleSelectedAttendees.length === 0) {
      CommonModal.error("Please select at least one attendee", "Validation Error");
      return;
    }

    // ✅ ADDED: Validation for required fields
    const meetingTitle = document.getElementById("meetingTitle").value;
    const meetingDate = document.getElementById("meetingDate").value;
    const fromTime = document.getElementById("fromTime").value;
    const toTime = document.getElementById("toTime").value;
    const duration = document.getElementById("duration").value;
    const meetingDescription = document.getElementById("meetingDescription").value;

    if (!meetingTitle || meetingTitle.trim() === '') {
      CommonModal.error("Please enter meeting title", "Validation Error");
      return;
    }

    if (!meetingDate) {
      CommonModal.error("Please select meeting date", "Validation Error");
      return;
    }

    if (!fromTime || !toTime) {
      CommonModal.error("Please select both start and end times", "Validation Error");
      return;
    }

    // ✅ ADDED: Time validation
    if (fromTime >= toTime) {
      CommonModal.error("End time must be after start time", "Invalid Time");
      return;
    }

    if (!duration || duration <= 0) {
      CommonModal.error("Please enter valid duration", "Validation Error");
      return;
    }

    if (!meetingDescription || meetingDescription.trim() === '') {
      CommonModal.error("Please enter meeting description", "Validation Error");
      return;
    }

    const meetingMode = document.querySelector('input[name="meetingMode"]:checked').value;
    
    let locationInfo = "";
    if (meetingMode === "remote") {
      const links = Array.from(document.querySelectorAll(".meeting-link-input"))
        .map(input => input.value)
        .filter(link => link);
      
      // ✅ ADDED: Validation for meeting links
      if (links.length === 0) {
        CommonModal.error("Please add at least one meeting link for remote meetings", "Validation Error");
        return;
      }
      
      locationInfo = links.join(", ");
    } else {
      locationInfo = document.getElementById("meetingAddress").value;
      
      // ✅ ADDED: Validation for onsite address
      if (!locationInfo || locationInfo.trim() === '') {
        CommonModal.error("Please enter meeting address for onsite meetings", "Validation Error");
        return;
      }
    }

    const meeting = {
      id: Date.now(),
      title: meetingTitle,
      date: meetingDate,
      fromTime: fromTime,
      toTime: toTime,
      duration: duration,
      description: meetingDescription,
      attendees: [...scheduleSelectedAttendees],
      mode: meetingMode,
      location: locationInfo,
      mom: null,
    };

    meetings.push(meeting);
    renderMeetingsTable();
    closeScheduleMeetingModal();
    
    // ✅ ADDED: Success notification
    CommonModal.success(`Meeting "${meetingTitle}" scheduled successfully!`);
  });

  // Upload MOM Form Submit
  document.getElementById("uploadMomForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // ✅ REPLACED: alert with CommonModal
    if (momSelectedAttendees.length === 0) {
      CommonModal.error("Please select at least one attendee", "Validation Error");
      return;
    }

    // ✅ ADDED: Validation for required fields
    const momProjectName = document.getElementById("momProjectName").value;
    const momCustomerName = document.getElementById("momCustomerName").value;
    const momDepartment = document.getElementById("momDepartment").value;
    const momEmail = document.getElementById("momEmail").value;
    const momPhone = document.getElementById("momPhone").value;
    const momObjective = document.getElementById("momObjective").value;
    const momConclusion = document.getElementById("momConclusion").value;

    if (!momProjectName || momProjectName.trim() === '') {
      CommonModal.error("Please enter project name", "Validation Error");
      return;
    }

    if (!momCustomerName || momCustomerName.trim() === '') {
      CommonModal.error("Please enter customer name", "Validation Error");
      return;
    }

    if (!momDepartment || momDepartment.trim() === '') {
      CommonModal.error("Please enter department", "Validation Error");
      return;
    }

    if (!momEmail || momEmail.trim() === '') {
      CommonModal.error("Please enter email address", "Validation Error");
      return;
    }

    // ✅ ADDED: Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(momEmail)) {
      CommonModal.error("Please enter a valid email address", "Invalid Email");
      return;
    }

    if (!momPhone || momPhone.trim() === '') {
      CommonModal.error("Please enter phone number", "Validation Error");
      return;
    }

    if (!momObjective || momObjective.trim() === '') {
      CommonModal.error("Please enter meeting objective", "Validation Error");
      return;
    }

    if (!momConclusion || momConclusion.trim() === '') {
      CommonModal.error("Please enter meeting conclusion", "Validation Error");
      return;
    }

    const meetingId = parseInt(document.getElementById("momMeetingId").value);
    const meeting = meetings.find(m => m.id === meetingId);

    if (meeting) {
      meeting.mom = {
        date: document.getElementById("momDate").value,
        time: document.getElementById("momTime").value,
        order: document.getElementById("momOrder").value,
        projectName: momProjectName,
        customerName: momCustomerName,
        department: momDepartment,
        email: momEmail,
        phone: momPhone,
        duration: document.getElementById("momDuration").value,
        attendees: [...momSelectedAttendees],
        fromTime: document.getElementById("momFromTime").value,
        toTime: document.getElementById("momToTime").value,
        location: document.getElementById("momLocation").value,
        objective: momObjective,
        conclusion: momConclusion,
      };

      renderMeetingsTable();
      closeUploadMomModal();
      
      // ✅ ADDED: Success notification
      CommonModal.success(`Minutes of Meeting uploaded for "${meeting.title}"!`);
    } else {
      // ✅ ADDED: Error notification
      CommonModal.error("Meeting not found", "Error");
    }
  });
});

// Upload MOM Modal
function openUploadMomModal(meetingId) {
  const meeting = meetings.find(m => m.id === meetingId);
  
  // ✅ ADDED: Check if meeting exists
  if (!meeting) {
    CommonModal.error("Meeting not found", "Error");
    return;
  }

  document.getElementById("uploadMomModal").classList.add("active");
  document.getElementById("uploadMomModal").style.display = "flex";
  document.getElementById("momMeetingId").value = meetingId;
  momSelectedAttendees = [];
  renderMomAttendeeTags();
  updateMomDropdownVisibility();
}

function closeUploadMomModal() {
  document.getElementById("uploadMomModal").classList.remove("active");
  document.getElementById("uploadMomModal").style.display = "none";
  document.getElementById("uploadMomForm").reset();
  momSelectedAttendees = [];
  renderMomAttendeeTags();
  updateMomDropdownVisibility();
}

// View Details Modal
function openViewDetailsModal(meetingId) {
  const meeting = meetings.find(m => m.id === meetingId);
  
  // ✅ ADDED: Check if meeting exists
  if (!meeting) {
    CommonModal.error("Meeting not found", "Error");
    return;
  }

  document.getElementById("viewMeetingTitle").textContent = meeting.title;
  document.getElementById("viewMeetingDate").textContent = meeting.date;
  document.getElementById("viewFromTime").textContent = meeting.fromTime;
  document.getElementById("viewToTime").textContent = meeting.toTime;
  document.getElementById("viewDuration").textContent = meeting.duration + " minutes";
  document.getElementById("viewMeetingMode").textContent = meeting.mode.charAt(0).toUpperCase() + meeting.mode.slice(1);
  document.getElementById("viewDescription").textContent = meeting.description;
  document.getElementById("viewAttendees").textContent = meeting.attendees.join(", ");
  
  // Handle Location/Link with clickable links
  const locationElement = document.getElementById("viewLocation");
  if (meeting.location) {
    const urls = meeting.location.split(", ");
    const isUrl = urls.some(url => url.startsWith("http"));
    
    if (isUrl) {
      locationElement.innerHTML = urls.map(url => {
        if (url.startsWith("http")) {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #2D6BFF; text-decoration: underline; display: block; margin-bottom: 0.5rem;">${url}</a>`;
        }
        return url;
      }).join("");
    } else {
      locationElement.textContent = meeting.location;
    }
  } else {
    locationElement.textContent = "-";
  }

  if (meeting.mom) {
    document.getElementById("momSection").style.display = "block";
    document.getElementById("viewMomCustomer").textContent = meeting.mom.customerName;
    document.getElementById("viewMomDepartment").textContent = meeting.mom.department;
    document.getElementById("viewMomEmail").textContent = meeting.mom.email;
    document.getElementById("viewMomPhone").textContent = meeting.mom.phone;
    document.getElementById("viewMomObjective").textContent = meeting.mom.objective;
    document.getElementById("viewMomConclusion").textContent = meeting.mom.conclusion;
  } else {
    document.getElementById("momSection").style.display = "none";
  }

  document.getElementById("viewDetailsModal").classList.add("active");
  document.getElementById("viewDetailsModal").style.display = "flex";
}

function closeViewDetailsModal() {
  document.getElementById("viewDetailsModal").classList.remove("active");
  document.getElementById("viewDetailsModal").style.display = "none";
}

// Delete Meeting
function deleteMeeting(meetingId) {
  const meeting = meetings.find(m => m.id === meetingId);
  
  // ✅ ADDED: Check if meeting exists
  if (!meeting) {
    CommonModal.error("Meeting not found", "Error");
    return;
  }

  // ✅ REPLACED: confirm with CommonModal.confirm
  CommonModal.confirm(
    `Are you sure you want to delete the meeting "${meeting.title}"?`,
    'Delete Meeting',
    function() {
      // User confirmed - delete meeting
      meetings = meetings.filter(m => m.id !== meetingId);
      renderMeetingsTable();
      CommonModal.success('Meeting deleted successfully!');
    }
    // onCancel is optional - do nothing if cancelled
  );
}

// Render Meetings Table
function renderMeetingsTable() {
  const tbody = document.getElementById("meetingTableBody");

  if (meetings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2rem; color: #64748B;">
          No meetings scheduled yet. Click "Add Meeting" to get started.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = meetings.map((meeting, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${meeting.date}</td>
      <td>${meeting.description.substring(0, 30)}...</td>
      <td>${meeting.fromTime}</td>
      <td>${meeting.toTime}</td>
      <td>${meeting.title}</td>
      <td>${meeting.mom ? meeting.mom.projectName : "-"}</td>
      <td>
        <button class="action-btn action-btn-add" onclick="openUploadMomModal(${meeting.id})">
          + Add
        </button>
      </td>
      <td>
        <button class="action-btn action-btn-view" onclick="openViewDetailsModal(${meeting.id})">
          <img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon">
        </button>
      </td>
      <td>
        <button class="action-btn action-btn-delete" onclick="deleteMeeting(${meeting.id})">
          <img src="/FISTO_FINANCE/assets/images/tabler_delete_icon.webp" alt="delete icon">
        </button>
      </td>
    </tr>
  `).join("");
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const scheduleDropdown = document.getElementById("scheduleAttendeesMenu");
  const scheduleButton = document.getElementById("scheduleAttendeesDropdown");
  const momDropdown = document.getElementById("momAttendeesMenu");
  const momButton = document.getElementById("momAttendeesDropdown");

  if (scheduleDropdown && scheduleButton) {
    if (!scheduleButton.contains(event.target) && !scheduleDropdown.contains(event.target)) {
      scheduleDropdown.classList.remove("active");
      scheduleButton.classList.remove("active");
    }
  }

  if (momDropdown && momButton) {
    if (!momButton.contains(event.target) && !momDropdown.contains(event.target)) {
      momDropdown.classList.remove("active");
      momButton.classList.remove("active");
    }
  }
});

// Close modal on outside click
window.onclick = function (event) {
  if (event.target.classList.contains("modal")) {
    event.target.classList.remove("active");
    event.target.style.display = "none";
  }
};

// Initialize
renderMeetingsTable();
