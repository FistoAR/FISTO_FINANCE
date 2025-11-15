/* ===================================
   HEADER.JS - Header Functionality
   =================================== */

// ===================================
// UPDATE USER INFO FROM SESSIONSTORAGE
// ===================================
function updateUserInfo(name, role, id) {
  const welcomeText = document.querySelector('.welcome-text');
  const roleText = document.querySelector('.role-text');
  
  if (welcomeText) {
    welcomeText.textContent = `Welcome, ${name}`;
  }
  
  if (roleText) {
    roleText.textContent = `Role: ${role} | ID: ${id}`;
  }
}

// Load user from sessionStorage and update header
function loadUserFromSession() {
  const userStr = sessionStorage.getItem('user');  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);      
      if (user && user.employee_name && user.designation && user.employee_id) {
        updateUserInfo(user.employee_name, user.designation, user.employee_id);
      }
    } catch (e) {
      console.error('Error parsing user from sessionStorage:', e);
    }
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', loadUserFromSession);

// ===================================
// SCROLL SHADOW EFFECT
// ===================================
function updateHeaderShadow() {
  const header = document.querySelector('.header');
  const mainContent = document.querySelector('.main-content');
  
  if (header && mainContent) {
    if (mainContent.scrollTop > 10) {
      header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    } else {
      header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.02)';
    }
  }
}

const mainContent = document.querySelector('.main-content');
if (mainContent) {
  mainContent.addEventListener('scroll', updateHeaderShadow);
}

// ===================================
// DATE AND TIME FUNCTIONALITY
// ===================================
function updateDateTime() {
  const datetimeText = document.getElementById('datetimeText');
  
  if (datetimeText) {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    
    const fullDateTime = `${dayName} ${date} ${monthName}, ${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
    datetimeText.textContent = fullDateTime;
  }
}

updateDateTime();
setInterval(updateDateTime, 1000);

// ===================================
// HEADER ICON BUTTON ACTIONS
// ===================================
const notificationBtn = document.getElementById('notificationBtn');
const messageBtn = document.getElementById('messageBtn');
const settingsBtn = document.getElementById('settingsBtn');

if (notificationBtn) {
  notificationBtn.addEventListener('click', function() {
    console.log('Notification button clicked');
  });
}

if (messageBtn) {
  messageBtn.addEventListener('click', function() {
    console.log('Message button clicked');
  });
}

if (settingsBtn) {
  settingsBtn.addEventListener('click', function() {
    console.log('Settings button clicked');
  });
}

console.log('Header.js loaded successfully - DateTime & Actions ready!');
