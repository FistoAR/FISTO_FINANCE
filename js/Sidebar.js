/* ===================================
   SIDEBAR.JS - Sidebar Functionality
   =================================== */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const navItems = document.querySelectorAll('.nav-item');
  const logoutBtn = document.getElementById('logoutBtn');

  // Toggle sidebar open/close
  function toggleSidebar() {
    if (sidebar && sidebarToggle && sidebarOverlay) {
      sidebar.classList.toggle('open');
      sidebarToggle.classList.toggle('active');
      sidebarOverlay.classList.toggle('active');
      
      // Prevent body scroll when sidebar is open on mobile/tablet
      if (window.innerWidth <= 1024) {
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
      }
    }
  }

  // Close sidebar
  function closeSidebar() {
    if (sidebar && sidebarToggle && sidebarOverlay) {
      sidebar.classList.remove('open');
      sidebarToggle.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Toggle button click
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleSidebar();
    });
  }

  // Close button click
  if (sidebarClose) {
    sidebarClose.addEventListener('click', function(e) {
      e.stopPropagation();
      closeSidebar();
    });
  }

  // Overlay click to close
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar when clicking outside on mobile/tablet
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !sidebarToggle?.contains(e.target)) {
        closeSidebar();
      }
    }
  });

  // Handle navigation item clicks
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // Add active class to clicked item
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
      
      // Close sidebar on mobile/tablet after navigation
      if (window.innerWidth <= 1024) {
        setTimeout(() => {
          closeSidebar();
        }, 200);
      }
    });
  });

  // Logout button functionality
  // Logout button functionality
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    console.log('Logout button clicked');
    sessionStorage.removeItem('user'); // Remove login user info
    window.location.href = '/'; // Redirect to login page (index)
  });
}


  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 1024) {
      closeSidebar();
    }
  });

  // Handle escape key to close sidebar
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar?.classList.contains('open')) {
      closeSidebar();
    }
  });

  console.log('Sidebar.js loaded successfully!');
});
