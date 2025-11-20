// === Begin Data and State ===
const projectsData = [
  {
    id: 1,
    name: "CRM Development - Phase 1",
    totalBudget: 500000,
    actualSpending: 480000,
    startDate: "2025-01-15",
    endDate: "2025-04-15",
    employees: [
      { id: 1, name: "Rajesh Kumar", role: "Frontend Developer", salary: 45000 },
      { id: 2, name: "Priya Sharma", role: "Backend Developer", salary: 50000 },
      { id: 3, name: "Amit Patel", role: "UI/UX Designer", salary: 40000 }
    ]
  },
  {
    id: 2,
    name: "Finance App Modernization",
    totalBudget: 750000,
    actualSpending: 820000,
    startDate: "2025-02-01",
    endDate: "2025-06-30",
    employees: [
      { id: 4, name: "Sneha Reddy", role: "Full Stack Developer", salary: 55000 },
      { id: 5, name: "Vikram Singh", role: "Database Admin", salary: 48000 },
      { id: 6, name: "Anjali Verma", role: "QA Engineer", salary: 42000 },
      { id: 7, name: "Rohit Mehta", role: "DevOps Engineer", salary: 52000 }
    ]
  }
];

let chartInstance = null;
let selectedProject = null;
let currentChartType = 'combined';

// === Get current context (single or all projects) ===
function getCurrentContext() {
  const selectVal = document.getElementById('projectSelect').value;

  if (!selectVal) {
    // ALL projects mode - aggregate all data
    const totalBudget = projectsData.reduce((s,p)=>s+p.totalBudget,0);
    const totalActual = projectsData.reduce((s,p)=>s+p.actualSpending,0);
    const allEmployees = projectsData.flatMap(p=>p.employees);
    const startDates = projectsData.map(p=>new Date(p.startDate));
    const endDates = projectsData.map(p=>new Date(p.endDate));
    const minStart = new Date(Math.min(...startDates));
    const maxEnd = new Date(Math.max(...endDates));

    return {
      isAll: true,
      name: "All Projects",
      totalBudget,
      actualSpending: totalActual,
      startDate: minStart.toISOString().slice(0,10),
      endDate: maxEnd.toISOString().slice(0,10),
      employees: allEmployees
    };
  }

  // Single project mode
  return {
    isAll: false,
    ...selectedProject
  };
}

function getCurrentOverdueLoss(ctx) {
  const today = new Date();
  const endDate = new Date(ctx.endDate);
  if (today <= endDate) return 0;
  const daysOverdue = Math.ceil((today - endDate) / (1000*60*60*24));
  const totalSalary = ctx.employees.reduce((s,e)=>s+e.salary,0);
  const dailySalaryCost = totalSalary/30;
  const overdueSalaryCost = dailySalaryCost * daysOverdue;
  const delayPenalty = ctx.totalBudget * 0.15 * (daysOverdue/30);
  return overdueSalaryCost + delayPenalty;
}

// === Initialize dashboard ===
function init() {
  calculateOverallStats();
  populateProjectDropdown();
  setupEventListeners();
  
  // Initialize with "All project" selected
  document.getElementById('projectSelect').value = '';
  selectedProject = null;
  updateForCurrentContext();
}

function calculateOverallStats() {
  const totalBudget = projectsData.reduce((s, p) => s + p.totalBudget, 0);
  const totalEmp = projectsData.reduce((s, p) => s + p.employees.length, 0);
  document.getElementById('totalBudget').textContent = formatCurrency(totalBudget);
  document.getElementById('projectCount').textContent = projectsData.length;
  document.getElementById('totalEmployees').textContent = totalEmp;
}

function populateProjectDropdown() {
  const select = document.getElementById('projectSelect');
  // First option is already "All project" in HTML
  projectsData.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.name;
    select.appendChild(option);
  });
}

function setupEventListeners() {
  document.getElementById('projectSelect').addEventListener('change', handleProjectSelect);
}

function handleProjectSelect(e) {
  const val = e.target.value;

  if (!val) {
    // ALL projects mode
    selectedProject = null;
    updateForCurrentContext();
    return;
  }

  const id = parseInt(val);
  selectedProject = projectsData.find(p => p.id === id) || null;
  updateForCurrentContext();
}

function updateForCurrentContext() {
  const ctx = getCurrentContext();
  if (!ctx) {
    resetDashboard();
    return;
  }
  updateStats(ctx);
  renderEmployees(ctx);
  updateFinancialMetrics(ctx);
  renderStatusAlert(ctx);
  renderChart(ctx);
}

function updateStats(ctx) {
  const duration = calculateDuration(ctx.startDate, ctx.endDate);
  const dailyBudget = duration > 0 ? ctx.totalBudget / duration : 0;
  const today = new Date();
  const endDate = new Date(ctx.endDate);
  const isOverdue = today > endDate;

  document.getElementById('projectTitle').textContent = ctx.name;
  document.getElementById('statBudget').textContent = formatCurrency(ctx.totalBudget);
  document.getElementById('statStart').textContent = formatDateShort(ctx.startDate);
  document.getElementById('statDuration').textContent = `${duration} days`;
  document.getElementById('statTeam').textContent = ctx.employees.length;
  document.getElementById('statDaily').textContent = formatCurrency(dailyBudget);

  const endDateBox = document.getElementById('endDateBox');
  const durationBox = document.getElementById('durationBox');

  if (isOverdue) {
    const daysOverdue = Math.ceil((today - endDate) / (1000*60*60*24));
    endDateBox.classList.add('overdue');
    durationBox.classList.add('overdue');
    const overdueEl = document.getElementById('statEnd');
    overdueEl.classList.add('danger');
    overdueEl.innerHTML = `${formatDateShort(ctx.endDate)}<br><small style="font-size:0.7vw; color: red;">⚠ ${daysOverdue} days overdue</small>`;
  } else {
    endDateBox.classList.remove('overdue');
    durationBox.classList.remove('overdue');
    const el = document.getElementById('statEnd');
    el.classList.remove('danger');
    el.textContent = formatDateShort(ctx.endDate);
  }
}

function updateFinancialMetrics(ctx) {
  document.getElementById('financialMetrics').style.display = 'grid';

  const planned = ctx.totalBudget;
  const actual = ctx.actualSpending;
  const overdueLoss = getCurrentOverdueLoss(ctx);
  const totalLoss = actual - planned + overdueLoss;
  const variance = planned - actual - overdueLoss;
  const usagePercent = ((actual + overdueLoss) / planned * 100).toFixed(1);

  const varianceCard = document.getElementById('varianceCard');
  const varianceEl = document.getElementById('metricVariance');

  if (overdueLoss > 0) {
    varianceCard.classList.add('highlight-loss');
    varianceEl.textContent = formatCurrency(Math.abs(totalLoss));
    varianceEl.className = 'ab-metric-value negative';
    const badge = document.getElementById('metricBadge');
    badge.textContent = `₹${formatNumber(overdueLoss)} Overdue Loss`;
    badge.className = 'ab-metric-badge overdue-loss';
  } else {
    varianceCard.classList.remove('highlight-loss');
    varianceEl.textContent = formatCurrency(Math.abs(variance));
    varianceEl.className = 'ab-metric-value ' + (variance >= 0 ? 'positive' : 'negative');
    const badge = document.getElementById('metricBadge');
    if (variance >= 0) {
      badge.textContent = `₹${formatNumber(variance)} Under Budget`;
      badge.className = 'ab-metric-badge profit';
    } else {
      badge.textContent = `₹${formatNumber(Math.abs(variance))} Over Budget`;
      badge.className = 'ab-metric-badge loss';
    }
  }

  const usageEl = document.getElementById('metricUsage');
  usageEl.textContent = usagePercent + '%';
  usageEl.className = 'ab-metric-value ' + (usagePercent <= 100 ? 'positive' : 'negative');

  const statusEl = document.getElementById('metricStatus');
  if (overdueLoss > 0) {
    statusEl.textContent = '🔴 Project overdue with losses';
  } else if (usagePercent < 80) {
    statusEl.textContent = '✓ Well within budget';
  } else if (usagePercent <= 100) {
    statusEl.textContent = '⚠ Approaching limit';
  } else {
    statusEl.textContent = '⚠ Budget exceeded';
  }
}

function renderStatusAlert(ctx) {
  const planned = ctx.totalBudget;
  const actual = ctx.actualSpending;
  const overdueLoss = getCurrentOverdueLoss(ctx);
  const variance = planned - actual - overdueLoss;
  const usagePercent = ((actual + overdueLoss) / planned * 100).toFixed(1);
  const today = new Date();
  const endDate = new Date(ctx.endDate);
  const isOverdue = today > endDate;

  let alertClass = 'ab-warning';
  let icon = '⚠️';
  let title = ctx.isAll ? 'All Projects Status' : 'Project On Track';
  let message = `Budget utilization is at ${usagePercent}%. Continue monitoring expenses.`;

  if (isOverdue) {
    const daysOverdue = Math.ceil((today - endDate) / (1000*60*60*24));
    alertClass = '';
    icon = '🔴';
    title = ctx.isAll ? 'All Projects - Some Overdue!' : 'Project Overdue - Critical Loss!';
    message = `${ctx.isAll ? 'Portfolio' : 'Project'} is ${daysOverdue} days overdue. Additional loss of ${formatCurrency(overdueLoss)} due to delays and ongoing salary costs. Total overrun: ${formatCurrency(actual - planned + overdueLoss)}.`;
  } else if (variance < 0) {
    alertClass = '';
    icon = '🔴';
    title = 'Budget Overrun Detected!';
    message = `${ctx.isAll ? 'Overall portfolio' : 'Project'} is over budget by ${formatCurrency(Math.abs(variance))}. Immediate action required.`;
  } else if (variance > 0 && actual < planned) {
    alertClass = 'ab-success';
    icon = '✅';
    title = 'On Track';
    message = `${ctx.isAll ? 'All projects are' : 'Project is'} ${usagePercent}% complete with ${formatCurrency(variance)} remaining.`;
  } else if (usagePercent > 90) {
    alertClass = 'ab-warning';
    icon = '⚠️';
    title = 'Approaching Budget Limit';
    message = `${usagePercent}% of budget utilized. Monitor closely.`;
  }

  document.getElementById('statusAlert').innerHTML = `
    <div class="ab-status-alert ${alertClass}">
      <div class="ab-status-alert-icon">${icon}</div>
      <div class="ab-status-alert-content">
        <div class="ab-status-alert-title">${title}</div>
        <div class="ab-status-alert-message">${message}</div>
      </div>
    </div>
  `;
}

function renderEmployees(ctx) {
  const container = document.getElementById('employeeList');
  const badge = document.getElementById('employeeCountBadge');

  container.innerHTML = '';
  badge.textContent = ctx.employees.length;

  ctx.employees.forEach(emp => {
    const item = document.createElement('div');
    item.className = 'ab-employee-item';
    item.innerHTML = `
      <div class="ab-employee-avatar">${emp.name.charAt(0)}</div>
      <div class="ab-employee-details">
        <div class="ab-employee-name">${escapeHtml(emp.name)}</div>
        <div class="ab-employee-role">${escapeHtml(emp.role)}</div>
      </div>
      <div class="ab-employee-salary">${formatCurrency(emp.salary)}</div>
    `;
    container.appendChild(item);
  });

  const totalSalary = ctx.employees.reduce((s, emp) => s + emp.salary, 0);
  const summary = document.createElement('div');
  summary.className = 'ab-salary-summary';
  summary.innerHTML = `
    <span class="ab-summary-label">Total Monthly Cost</span>
    <span class="ab-summary-amount">${formatCurrency(totalSalary)}</span>
  `;
  container.appendChild(summary);
}

function switchChart(event, type) {
  currentChartType = type;
  document.querySelectorAll('.ab-tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.ab-tab-btn').classList.add('active');
  const ctx = getCurrentContext();
  if (ctx) renderChart(ctx);
}

function renderChart(ctxData) {
  const canvas = document.getElementById('mainChart');
  const ctx = canvas.getContext('2d');

  if (chartInstance) chartInstance.destroy();

  const totalSalary = ctxData.employees.reduce((s, e) => s + e.salary, 0);
  const duration = calculateDuration(ctxData.startDate, ctxData.endDate);
  const salaryCost = totalSalary * (duration / 30);
  const remaining = ctxData.totalBudget - salaryCost;
  const planned = ctxData.totalBudget;
  const actual = ctxData.actualSpending;
  const overdueLoss = getCurrentOverdueLoss(ctxData);
  const variance = planned - actual - overdueLoss;
  const totalCost = actual + overdueLoss;

  if (currentChartType === 'combined') {
    const labels = ['Budget', 'Salary Cost', 'Actual Spent'];
    const data = [planned, salaryCost, actual];
    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(251, 191, 36, 0.8)',
      actual <= planned ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
    ];
    if (overdueLoss > 0) {
      labels.push('Overdue Loss');
      data.push(overdueLoss);
      colors.push('rgba(220, 38, 38, 0.9)');
    } else {
      labels.push(variance >= 0 ? 'Remaining' : 'Overrun');
      data.push(Math.abs(variance));
      colors.push(variance >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)');
    }

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Amount (₹)', data, backgroundColor: colors, borderRadius: 8, borderWidth: 2, borderColor: '#fff' }] },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: overdueLoss > 0 ? 'Financial Overview: OVERDUE - Loss Calculated' : (ctxData.isAll ? 'All Projects: Budget vs Actual' : 'Financial Overview: Budget vs Actual'),
            font: { size: 16, weight: 'bold' },
            color: overdueLoss > 0 ? '#ef4444' : '#1e293b'
          },
          tooltip: { callbacks: { label: c => '₹' + c.parsed.y.toLocaleString('en-IN') } }
        },
        scales: { y: { beginAtZero: true, ticks: { callback: val => '₹' + (val / 1000) + 'K' } } }
      }
    });
  } else if (currentChartType === 'breakdown') {
    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: overdueLoss > 0 ? ['Salary Cost', 'Other Expenses', 'Overdue Loss'] : ['Salary Cost', 'Other Expenses', 'Remaining'],
        datasets: [{
          data: overdueLoss > 0 ? [salaryCost, actual - salaryCost, overdueLoss] : [salaryCost, Math.max(0, actual - salaryCost), Math.max(0, remaining)],
          backgroundColor: overdueLoss > 0 ? ['rgba(251, 191, 36, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(220, 38, 38, 0.9)'] : ['rgba(251, 191, 36, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(34, 197, 94, 0.8)']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: {
          title: { display: true, text: ctxData.isAll ? 'All Projects: Budget Breakdown' : 'Budget Breakdown', font: { size: 16, weight: 'bold' } },
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: c => c.label + ': ₹' + c.parsed.toLocaleString('en-IN') } }
        }
      }
    });
  } else if (currentChartType === 'comparison') {
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Planned Budget', 'Actual + Overdue Loss'],
        datasets: [
          { label: 'Planned', data: [planned, null], backgroundColor: 'rgba(59, 130, 246, 0.8)', borderRadius: 8 },
          { label: 'Actual Cost', data: [null, totalCost], backgroundColor: totalCost <= planned ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)', borderRadius: 8 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: {
          title: {
            display: true,
            text: overdueLoss > 0 ? 'Profit/Loss: CRITICAL - Overdue Penalty Applied' : (ctxData.isAll ? 'All Projects: Profit/Loss Comparison' : 'Profit/Loss Comparison'),
            font: { size: 16, weight: 'bold' },
            color: overdueLoss > 0 ? '#ef4444' : '#1e293b'
          },
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: c => c.dataset.label + ': ₹' + c.parsed.y.toLocaleString('en-IN') } }
        },
        scales: { y: { beginAtZero: true, ticks: { callback: val => '₹' + (val / 1000) + 'K' } } }
      }
    });
  }
}

function calculateDuration(start, end) {
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
}
function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}
function formatNumber(num) {
  return num.toLocaleString('en-IN');
}
function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
function resetDashboard() {
  document.getElementById('projectSelect').value = '';
  selectedProject = null;
  updateForCurrentContext();
}

document.addEventListener('DOMContentLoaded', init);
