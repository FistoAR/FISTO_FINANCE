// /public/js/login.js

document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const employeeId = document.getElementById('employeeId').value;
  const password = document.getElementById('password').value;

  const apiUrl = 'https://www.fist-o.com/fisto_finance_app/api/login.php';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ employee_id: employeeId, password })
    });
    const result = await response.json();

    if (result.success) {
      // Store user data for use in header
      sessionStorage.setItem('user', JSON.stringify({
        employee_name: result.employee_name,
        designation: result.designation,
        employee_id: result.employee_id
      }));
      // window.location.href = '/dashboard';
      window.location.href = '/FISTO_FINANCE/dashboard';
    } else {
      document.getElementById('errorMessage').style.display = 'block';
      document.getElementById('errorMessage').textContent = result.message;
    }
  } catch (err) {
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('errorMessage').textContent = "Server error or invalid response.";
  }
});
