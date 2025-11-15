/* ===================================
   PROJECTS.JS - Main Entry Point
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

  console.log('Projects.js loaded successfully!');
});