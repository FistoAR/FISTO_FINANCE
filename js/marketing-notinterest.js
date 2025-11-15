// marketing-notinterest.js
const NOT_INTEREST_STATUSES = [
  'Not Interested / Not Needed',
  'Not Interested',
  'Not Interest',
  'Not Interested / Not Need'
];



function renderNotInterestTable() {
  const tbody = document.getElementById('notInterestTableBody');
  if (!tbody) return;

  // Filter followUps for not-interested statuses only
  const rows = (typeof followUps !== 'undefined' && Array.isArray(followUps))
    ? followUps.filter(f => NOT_INTEREST_STATUSES.includes((f.status || '').trim()))
    : [];

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2rem; color: #64748b;">
          No 'Not Interested' records yet.
        </td>
      </tr>
    `;
    return;
  }

 tbody.innerHTML = rows.map(followUp => {
    const updateDate = followUp.updateDate !== '-' ? formatDisplayDate(followUp.updateDate) : '-';
    const nextDate = followUp.nextFollowUpDate !== '-' ? formatDisplayDate(followUp.nextFollowUpDate) : '-';
    const initiatedDate = followUp.initiatedDate ? formatDisplayDate(followUp.initiatedDate) : '-';

    const opts = (typeof statusOptions !== 'undefined') ? statusOptions : [
      'Not Picking / Not Reachable', 'Not Interested / Not Needed', 'Need To follow up', 'Follow up Later', 'Not available'
    ];

    const optionsHtml = opts.map(option => `
      <div class="dropdown-item ${followUp.status === option ? 'active' : ''}"
           onclick="selectFollowupStatus(${followUp.customerDbId}, '${escapeJs(option)}')">
        ${option}
      </div>
    `).join('');

    return `
<tr>
  <td>
    <div class="custom-dropdown" data-followup-id="${followUp.customerDbId}">
      <button class="custom-dropdown-btn" onclick="toggleFollowupDropdown(${followUp.customerDbId})" type="button">
        <span class="selected-value">${escapeHtml(followUp.status || 'None')}</span>
        <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="custom-dropdown-menu" id="followup-dropdown-${followUp.customerDbId}">
        ${optionsHtml}
      </div>
    </div>
  </td>
  <td>
    <div style="color: #64748b; font-size: 0.9em; padding: 4px 0;">
      ${escapeHtml(followUp.status || 'No status')}
    </div>
  </td>
  <td>${escapeHtml(followUp.currentRemarks || '-')}</td>
  <td style="text-align: center;">${updateDate}</td>
  <td style="text-align: center;">${nextDate}</td>
  <td style="text-align: center;">${escapeHtml(followUp.customerID || '-')}</td>
  <td style="text-align: center;">${initiatedDate}</td>
  <td>${escapeHtml(followUp.companyName || '-')}</td>
  <td>${escapeHtml(followUp.customerName || '-')}</td>
  <td style="text-align: center;">
    <button class="followup-view-btn" onclick="openFollowupViewModal(${followUp.customerDbId})" type="button">
      <img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon">
    </button>
  </td>
</tr>
    `;
}).join('');

}

function escapeHtml(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function escapeJs(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
}

document.addEventListener('DOMContentLoaded', function() {
  renderNotInterestTable();
});

document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('tab-btn')) {
    const tabName = e.target.getAttribute('data-tab');
    if (tabName === 'not-interest') {
      setTimeout(renderNotInterestTable, 50);
    }
  }
});

window.renderNotInterestTable = renderNotInterestTable;
console.log('✅ Not Interest module loaded!');
