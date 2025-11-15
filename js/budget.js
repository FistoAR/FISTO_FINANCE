document.addEventListener("DOMContentLoaded", function () {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content"); // ← Needs .tab-content elements

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab"); // Gets "employee-details", etc.

      // Remove active from all
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active to clicked
      this.classList.add("active");
      document.getElementById(tabName).classList.add("active"); // ← Needs matching ID
    });
  });
});
