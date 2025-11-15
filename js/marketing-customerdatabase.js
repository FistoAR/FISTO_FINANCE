// ===================================
// Customer Database - CRUD Operations with Backend
// ===================================

const API_BASE = "https://www.fist-o.com/fisto_finance_app/api/customers";

let customers = [];
let addContactCounter = 1;
let editContactCounter = 1;

// ===================================
// INITIALIZE & LOAD DATA
// ===================================

document.addEventListener("DOMContentLoaded", function () {
  fetchCustomers();

  const today = new Date().toISOString().split("T")[0];
  const dateField = document.getElementById("addDate");
  if (dateField && !dateField.value) {
    dateField.value = today;
  }
});

// ===================================
// FETCH CUSTOMERS FROM BACKEND
// ===================================

async function fetchCustomers() {
  try {
    const response = await fetch(`${API_BASE}/get_customers.php`);
    const result = await response.json();

    if (result.success && result.customers) {
      customers = result.customers;
      console.log("✅ Loaded customers:", customers.length);
      renderCustomerTable();
    } else {
      throw new Error(result.message || "Failed to load customers");
    }
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    CommonModal.error("Failed to load customers from database", "Error");
    customers = [];
    renderCustomerTable();
  }
}

// ===================================
// CONTACT FIELD MANAGEMENT
// ===================================

function addContactField(mode) {
  const container =
    mode === "add"
      ? document.getElementById("addContactsContainer")
      : document.getElementById("editContactsContainer");

  const counter = mode === "add" ? ++addContactCounter : ++editContactCounter;

  const contactBlock = document.createElement("div");
  contactBlock.className = "contact-block";
  contactBlock.setAttribute("data-contact-index", counter);

  contactBlock.innerHTML = `
        <div class="contact-title">Contact ${counter}</div>
        <button type="button" class="btn-remove-contact" onclick="removeContactField(this)">×</button>
        <div class="form-grid form-grid-4">
            <div class="form-group">
                <label>Contact Person</label>
                <input type="text" class="contact-person" placeholder="Enter Contact Person" />
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" class="contact-phone" placeholder="+91 1234567890" />
            </div>
            <div class="form-group">
                <label>Mail ID</label>
                <input type="email" class="contact-email" placeholder="example@mail.com" />
            </div>
            <div class="form-group">
                <label>Designation</label>
                <input type="text" class="contact-designation" placeholder="Enter Designation" />
            </div>
        </div>
    `;

  container.appendChild(contactBlock);
}

function removeContactField(button) {
  const contactBlock = button.closest(".contact-block");
  if (contactBlock) {
    contactBlock.remove();
  }
}

// ===================================
// MODAL FUNCTIONS
// ===================================

function openAddModal() {
  const modal = document.getElementById("addCustomerModal");
  if (modal) {
    modal.style.display = "flex";
    resetAddForm();
  }
}

function closeAddModal() {
  const modal = document.getElementById("addCustomerModal");
  if (modal) {
    modal.style.display = "none";
    resetAddForm();
  }
}

function openEditModal(customerId) {
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return;

  const modal = document.getElementById("editCustomerModal");
  if (!modal) return;

  // Populate basic fields
  document.getElementById("editCustomerId").value = customer.id;
  document.getElementById("editCustomerName").value = customer.customerName;
  document.getElementById("editIndustryType").value = customer.industryType;
  document.getElementById("editWebsite").value = customer.website || "";
  document.getElementById("editAddress").value = customer.address || "";
  document.getElementById("editCity").value = customer.city || "";
  document.getElementById("editReference").value = customer.reference || "";
  document.getElementById("editRemarks").value = customer.remarks || "";

  // Project Details
  document.getElementById("editProjectName").value = customer.projectName || "";
  document.getElementById("editProjectCategory").value =
    customer.projectCategory || "";
  document.getElementById("editRequirement").value = customer.requirement || "";

  // Populate contact fields
  const contactsContainer = document.getElementById("editContactsContainer");
  contactsContainer.innerHTML = "";
  editContactCounter = 0;

  if (customer.contacts && customer.contacts.length > 0) {
    customer.contacts.forEach((contact, index) => {
      editContactCounter = index + 1;
      const contactBlock = document.createElement("div");
      contactBlock.className = "contact-block";
      contactBlock.setAttribute("data-contact-index", editContactCounter);

      contactBlock.innerHTML = `
                <div class="contact-title">Contact ${editContactCounter}</div>
                ${
                  index > 0
                    ? '<button type="button" class="btn-remove-contact" onclick="removeContactField(this)">×</button>'
                    : ""
                }
                <div class="form-grid form-grid-4">
                    <div class="form-group">
                        <label>Contact Person</label>
                        <input type="text" class="contact-person" value="${
                          contact.person || ""
                        }" placeholder="Enter Contact Person" />
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" class="contact-phone" value="${
                          contact.phone || ""
                        }" placeholder="+91 1234567890" />
                    </div>
                    <div class="form-group">
                        <label>Mail ID</label>
                        <input type="email" class="contact-email" value="${
                          contact.email || ""
                        }" placeholder="example@mail.com" />
                    </div>
                    <div class="form-group">
                        <label>Designation</label>
                        <input type="text" class="contact-designation" value="${
                          contact.designation || ""
                        }" placeholder="Enter Designation" />
                    </div>
                </div>
            `;

      contactsContainer.appendChild(contactBlock);
    });
  } else {
    // Add default contact if none exists
    editContactCounter = 1;
    contactsContainer.innerHTML = `
            <div class="contact-block" data-contact-index="1">
                <div class="contact-title">Contact 1</div>
                <div class="form-grid form-grid-4">
                    <div class="form-group">
                        <label>Contact Person</label>
                        <input type="text" class="contact-person" placeholder="Enter Contact Person" />
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" class="contact-phone" placeholder="+91 1234567890" />
                    </div>
                    <div class="form-group">
                        <label>Mail ID</label>
                        <input type="email" class="contact-email" placeholder="example@mail.com" />
                    </div>
                    <div class="form-group">
                        <label>Designation</label>
                        <input type="text" class="contact-designation" placeholder="Enter Designation" />
                    </div>
                </div>
            </div>
        `;
  }

  modal.style.display = "flex";
}

function closeEditModal() {
  const modal = document.getElementById("editCustomerModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// ===================================
// COLLECT CONTACT DATA
// ===================================

function collectContactData(containerId) {
  const container = document.getElementById(containerId);
  const contactBlocks = container.querySelectorAll(".contact-block");
  const contacts = [];

  contactBlocks.forEach((block) => {
    const person = block.querySelector(".contact-person").value.trim();
    const phone = block.querySelector(".contact-phone").value.trim();
    const email = block.querySelector(".contact-email").value.trim();
    const designation = block
      .querySelector(".contact-designation")
      .value.trim();

    if (person || phone || email || designation) {
      contacts.push({ person, phone, email, designation });
    }
  });

  return contacts;
}

// ===================================
// FORM SUBMISSION HANDLERS (with Backend)
// ===================================

async function submitAddCustomer(event) {
  event.preventDefault();

  const contacts = collectContactData("addContactsContainer");

  const customerData = {
    employee_id: "",
    date: document.getElementById("addDate").value,
    company_name: document.getElementById("addCompanyName").value,
    customer_name: document.getElementById("addCustomerName").value,
    industry_type: document.getElementById("addIndustryType").value,
    website: document.getElementById("addWebsite").value,
    address: document.getElementById("addAddress").value,
    city: document.getElementById("addCity").value,
    reference: document.getElementById("addReference").value,
    remarks: document.getElementById("addRemarks").value || "",
    contacts: contacts,
    project_name: document.getElementById("addProjectName").value || "",
    project_category: document.getElementById("addProjectCategory").value || "",
    requirement: document.getElementById("addRequirement").value || "",
  };

  const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  if (storedUser && storedUser.employee_id) {
    customerData.employee_id = storedUser.employee_id;
  }

  try {
    const response = await fetch(`${API_BASE}/save_customer.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    const result = await response.json();

    if (result.success) {
      console.log("result", result);
      CommonModal.success("Customer added successfully!");
      closeAddModal();
      fetchCustomers(); // Reload from database
    } else {
      throw new Error(result.message || "Failed to save customer");
    }
  } catch (error) {
    console.error("❌ Error saving customer:", error);
    CommonModal.error("Error saving customer: " + error.message, "Save Error");
  }
}

const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
if (storedUser && storedUser.employee_id) {
  customerData.employee_id = storedUser.employee_id;
}

console.log("employee ID", storedUser);

async function submitEditCustomer(event) {
  event.preventDefault();

  const customerId = parseInt(document.getElementById("editCustomerId").value);
  const contacts = collectContactData("editContactsContainer");

  const customer = customers.find((c) => c.id === customerId);
  if (!customer) {
    CommonModal.error("Customer not found", "Error");
    return;
  }

  const customerData = {
    id: customerId,
    employee_id: null,
    date: customer.date, // Keep original date
    company_name: customer.companyName, // Keep original company name
    customer_name: document.getElementById("editCustomerName").value,
    industry_type: document.getElementById("editIndustryType").value,
    website: document.getElementById("editWebsite").value,
    address: document.getElementById("editAddress").value,
    city: document.getElementById("editCity").value,
    reference: document.getElementById("editReference").value,
    remarks: document.getElementById("editRemarks").value || "",
    contacts: contacts,
    project_name: document.getElementById("editProjectName").value || "",
    project_category:
      document.getElementById("editProjectCategory").value || "",
    requirement: document.getElementById("editRequirement").value || "",
  };

  // attach logged-in employee id (same as Add)
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  if (storedUser && storedUser.employee_id) {
    customerData.employee_id = storedUser.employee_id;
  }

  console.log("DEBUG: submitEditCustomer payload:", customerData);

  try {
    const response = await fetch(`${API_BASE}/save_customer.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    const result = await response.json();

    if (result.success) {
      CommonModal.success("Customer updated successfully!");
      closeEditModal();
      fetchCustomers(); // Reload from database
    } else {
      throw new Error(result.message || "Failed to update customer");
    }
  } catch (error) {
    console.error("❌ Error updating customer:", error);
    CommonModal.error(
      "Error updating customer: " + error.message,
      "Update Error"
    );
  }
}

// ===================================
// DELETE FUNCTION (with Backend)
// ===================================

function deleteCustomer(customerId) {
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return;

  CommonModal.confirm(
    `Are you sure you want to delete ${customer.customerName}?`,
    "Delete Customer",
    async function () {
      try {
        const response = await fetch(`${API_BASE}/delete_customer.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customer_id: customerId }),
        });

        const result = await response.json();

        if (result.success) {
          CommonModal.success("Customer deleted successfully!");
          fetchCustomers(); // Reload from database
        } else {
          throw new Error(result.message || "Failed to delete customer");
        }
      } catch (error) {
        console.error("❌ Error deleting customer:", error);
        CommonModal.error(
          "Error deleting customer: " + error.message,
          "Delete Error"
        );
      }
    }
  );
}

// ===================================
// RENDER TABLE
// ===================================

function renderCustomerTable() {
  const tbody = document.getElementById("customerTableBody");

  if (!tbody) return;

  if (customers.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #64748b;">
                    No customers added yet. Click "Add Customer" to get started.
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = customers
    .map(
      (customer) => `
        <tr>
            <td>${formatDate_ddMon_yy(customer.date)}</td>
            <td>${customer.customerID}</td>
            <td>${customer.companyName}</td>
            <td>${customer.customerName}</td>
            <td>${
              customer.website
                ? `<a href="${customer.website}" target="_blank" rel="noopener noreferrer">Link</a>`
                : "-"
            }</td>
            <td>${customer.reference || "-"}</td>
            <td>
                <button class="action-btn action-btn-edit" onclick="openEditModal(${
                  customer.id
                })">
                     <img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon">
                </button>
            </td>
            <td>
                <button class="action-btn action-btn-delete" onclick="deleteCustomer(${
                  customer.id
                })">
                     <img src="/FISTO_FINANCE/assets/images/tabler_delete_icon.webp" alt="delete icon">
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function formatDate_ddMon_yy(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2); // last two digits
    return `${day} ${month} ${year}`;
}


function resetAddForm() {
  const form = document.getElementById("addCustomerForm");
  if (form) {
    form.reset();
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("addDate").value = today;
  }

  // Reset contacts to default
  const contactsContainer = document.getElementById("addContactsContainer");
  contactsContainer.innerHTML = `
        <div class="contact-block" data-contact-index="1">
            <div class="contact-title">Contact 1</div>
            <div class="form-grid form-grid-4">
                <div class="form-group">
                    <label>Contact Person</label>
                    <input type="text" class="contact-person" placeholder="Enter Contact Person" />
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" class="contact-phone" placeholder="+91 1234567890" />
                </div>
                <div class="form-group">
                    <label>Mail ID</label>
                    <input type="email" class="contact-email" placeholder="example@mail.com" />
                </div>
                <div class="form-group">
                    <label>Designation</label>
                    <input type="text" class="contact-designation" placeholder="Enter Designation" />
                </div>
            </div>
        </div>
    `;
  addContactCounter = 1;
}

// Close modal when clicking outside
window.onclick = function (event) {
  const addModal = document.getElementById("addCustomerModal");
  const editModal = document.getElementById("editCustomerModal");

  if (event.target === addModal) {
    closeAddModal();
  }
  if (event.target === editModal) {
    closeEditModal();
  }
};

console.log("✅ Customer database module loaded with backend integration!");


