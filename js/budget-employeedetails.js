// ===================================
// EMPLOYEE MANAGEMENT - COMPLETE JS
// WITH DELETE DOCUMENT FUNCTIONALITY
// WITH AUTO-CALCULATE DURATION
// WITH COMMONMODAL INTEGRATION
// ===================================

// Global variables (outside DOMContentLoaded for global access)
let employeesData = [];
let currentEditingIndex = null;
const API_BASE = 'https://www.fist-o.com/fisto_finance_app/api/employee';

// Fetch and render employees
function fetchAndRenderEmployees() {
  fetch(`${API_BASE}/list.php`)
    .then(res => {
      if (!res.ok) throw new Error("Network error");
      return res.json();
    })
    .then(data => {
      console.log("Fetched employees:", data);
      employeesData = data.employees || [];
      renderEmployeeTable();
    })
    .catch(err => {
      console.error("Error fetching employees:", err);
      employeesData = [];
      renderEmployeeTable();
    });
}

function renderEmployeeTable() {
  const tableBody = document.getElementById("employeeTableBody");
  if (!tableBody) {
    console.error("Table body not found!");
    return;
  }

  tableBody.innerHTML = "";

  if (employeesData.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">No employees added yet. Click "Add Employee" to get started.</td></tr>`;
    return;
  }

  employeesData.forEach((emp, idx) => {
    const row = document.createElement("tr");

    // Find employee photo
    let photoUrl = null;
    let hasPhoto = false;

    if (emp.documents && emp.documents.length) {
      const photoDoc = emp.documents.find((doc) => doc.type === "Photo");
      if (photoDoc) {
        photoUrl = "https://www.fist-o.com/fisto_finance_app" + photoDoc.url;
        hasPhoto = true;
      }
    }

    // Get first letter of employee name for avatar placeholder
    const firstLetter = (emp.employee_name || "?").charAt(0).toUpperCase();

    // Create avatar HTML based on whether photo exists
    let avatarHTML = "";
    if (hasPhoto) {
      avatarHTML = `
    <div class="employee-avatar">
      <img src="${photoUrl}" alt="${emp.employee_name}" onerror="this.parentElement.innerHTML='<div class=\\'avatar-placeholder\\'>${firstLetter}</div>'">
    </div>
  `;
    } else {
      avatarHTML = `
    <div class="employee-avatar">
      <div class="avatar-placeholder">${firstLetter}</div>
    </div>
  `;
    }

    row.innerHTML = `
      <td>${emp.employee_id || ""}</td>
      <td>
        <div class="employee-name-cell">
      ${avatarHTML}
      <span>${emp.employee_name || ""}</span>
    </div>
      </td>
      <td>${emp.designation || ""}</td>
      <td>${emp.employment_type || ""}</td>
      <td>${emp.working_status || ""}</td>
      <td>${emp.email_personal || ""}</td>
      <td>${emp.phone_personal || ""}</td>
      <td>
        <button class="table-view-btn" data-index="${idx}">
          <img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon">
        </button>
      </td>
      <td>
        <button class="table-delete-btn" data-index="${idx}">
          <img src="/FISTO_FINANCE/assets/images/tabler_delete_icon.webp" alt="delete icon">
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Attach click handlers
  document.querySelectorAll(".table-view-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const idx = parseInt(this.getAttribute("data-index"));
      viewEmployee(idx);
    });
  });

  document.querySelectorAll(".table-delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const idx = parseInt(this.getAttribute("data-index"));
      deleteEmployee(idx);
    });
  });
}

function openModal(editIndex = null) {
  const modal = document.getElementById("employeeModal");
  if (!modal) {
    console.error("Modal not found!");
    return;
  }

  modal.style.display = "block";
  document.body.style.overflow = "hidden";
  currentEditingIndex = editIndex;

  const empForm = document.getElementById("employeeForm");
  const submitBtn = document.getElementById("empSubmitBtn");

  // Find password section
  const passwordInput = document.getElementById("password");
  const passwordSection = passwordInput
    ? passwordInput.closest(".emp-form-section")
    : null;
  const passwordError = document.getElementById("passwordError");

  if (empForm) {
    empForm.reset();

    // Clear all file previews
    [
      "employeePhoto",
      "resumeCV",
      "idProof",
      "certificates",
      "otherDocs",
    ].forEach((id) => {
      const preview = document.getElementById("preview-" + id);
      if (preview) preview.innerHTML = "";
    });
  }

  if (editIndex !== null && employeesData[editIndex]) {
    // VIEWING/EDITING MODE

    // ✅ Change button text to "Update Employee"
    if (submitBtn) {
      submitBtn.textContent = "Update Employee";
    }

    // Hide password section
    if (passwordSection) {
      passwordSection.style.display = "none";
    }
    if (passwordError) {
      passwordError.style.display = "none";
    }

    // Make password fields not required when viewing
    if (passwordInput) passwordInput.required = false;
    const confirmPasswordInput = document.getElementById("confirmPassword");
    if (confirmPasswordInput) confirmPasswordInput.required = false;

    const emp = employeesData[editIndex];
    console.log("=== VIEWING EMPLOYEE ===");
    console.log("Employee data:", emp);
    console.log("Documents:", emp.documents);

    // Fill form fields
    setFieldValue(empForm, "employeeId", emp.employee_id);
    setFieldValue(empForm, "employeeName", emp.employee_name);
    setFieldValue(empForm, "dob", emp.dob);
    setFieldValue(empForm, "emailPersonal", emp.email_personal);
    setFieldValue(empForm, "emailOfficial", emp.email_official);
    setFieldValue(empForm, "phonePersonal", emp.phone_personal);
    setFieldValue(empForm, "phoneOfficial", emp.phone_official);
    setFieldValue(empForm, "designation", emp.designation);
    setFieldValue(empForm, "workingStatus", emp.working_status);
    setFieldValue(empForm, "joinDate", emp.join_date);
    setFieldValue(empForm, "internStartDate", emp.intern_start_date);
    setFieldValue(empForm, "internEndDate", emp.intern_end_date);
    setFieldValue(empForm, "durationMonths", emp.duration_months);
    setFieldValue(empForm, "address", emp.address);

    // Set radio buttons
    if (emp.gender) {
      const genderRadio = empForm.querySelector(
        `input[name="gender"][value="${emp.gender}"]`
      );
      if (genderRadio) genderRadio.checked = true;
    }

    if (emp.employment_type) {
      const empTypeRadio = empForm.querySelector(
        `input[name="employmentType"][value="${emp.employment_type}"]`
      );
      if (empTypeRadio) empTypeRadio.checked = true;
    }

    // ✅ Setup duration calculation after filling dates
    setTimeout(() => {
      setupDurationCalculation();
    }, 100);

    // Display existing documents in preview containers
    if (
      emp.documents &&
      Array.isArray(emp.documents) &&
      emp.documents.length > 0
    ) {
      console.log(
        "✅ Loading " + emp.documents.length + " documents into preview areas"
      );

      // Map category to preview container ID
      const categoryToPreviewId = {
        Photo: "preview-employeePhoto",
        Resume: "preview-resumeCV",
        ID: "preview-idProof",
        Certificate: "preview-certificates",
        Other: "preview-otherDocs",
      };

      emp.documents.forEach((doc, index) => {
        const category = doc.type || doc.category;
        const previewId = categoryToPreviewId[category];

        if (!previewId) {
          console.warn("Unknown category:", category);
          return;
        }

        const previewContainer = document.getElementById(previewId);
        if (!previewContainer) {
          console.warn("Preview container not found:", previewId);
          return;
        }

        const fileName = doc.original_name || doc.url.split("/").pop();
        const fileUrl =
          "https://www.fist-o.com/fisto_finance_app" +
          (doc.url || doc.relative_path);
        const fileId = doc.id;
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
        const isPDF = /\.pdf$/i.test(fileName);

        console.log(`  - ${category}: ${fileName} (ID: ${fileId})`);

        const previewItem = document.createElement("div");
        previewItem.className = "emp-preview-item";
        previewItem.setAttribute("data-file-id", fileId);
        previewItem.setAttribute("data-employee-id", emp.employee_id);
        previewItem.setAttribute("data-file-name", fileName);

        if (isImage) {
          previewItem.innerHTML = `
      <button type="button" class="emp-preview-delete-btn" title="Delete this document">
        ×
      </button>
      <img src="${fileUrl}" 
           alt="${fileName}" 
           class="emp-preview-image"
           onerror="this.style.display='none';">
      <div class="emp-preview-file-name">${fileName}</div>
      <div class="emp-preview-actions">
        <button type="button" class="emp-preview-view-btn" onclick="viewFile('${fileUrl.replace(
          /'/g,
          "\\'"
        )}', '${fileName.replace(/'/g, "\\'")}', 'image')">
           View
        </button>
        <button type="button" class="emp-preview-download-btn" onclick="downloadFile('${fileUrl.replace(
          /'/g,
          "\\'"
        )}', '${fileName.replace(/'/g, "\\'")}')">
           Download
        </button>
      </div>
    `;
        } else if (isPDF) {
          previewItem.innerHTML = `
      <button type="button" class="emp-preview-delete-btn" title="Delete this document">
        ×
      </button>
      <div class="emp-preview-file">
        <span class="emp-preview-file-icon">📄</span>
        <div class="emp-preview-file-details">
          <div class="emp-preview-file-name">${fileName}</div>
          <div class="emp-preview-actions">
            <button type="button" class="emp-preview-view-btn" onclick="viewFile('${fileUrl.replace(
              /'/g,
              "\\'"
            )}', '${fileName.replace(/'/g, "\\'")}', 'pdf')">
               View
            </button>
            <button type="button" class="emp-preview-download-btn" onclick="downloadFile('${fileUrl.replace(
              /'/g,
              "\\'"
            )}', '${fileName.replace(/'/g, "\\'")}')">
              Download
            </button>
          </div>
        </div>
      </div>
    `;
        } else {
          previewItem.innerHTML = `
      <button type="button" class="emp-preview-delete-btn" title="Delete this document">
        ×
      </button>
      <div class="emp-preview-file">
        <span class="emp-preview-file-icon">📄</span>
        <div class="emp-preview-file-details">
          <div class="emp-preview-file-name">${fileName}</div>
          <div class="emp-preview-actions">
            <button type="button" class="emp-preview-download-btn" onclick="downloadFile('${fileUrl.replace(
              /'/g,
              "\\'"
            )}', '${fileName.replace(/'/g, "\\'")}')">
              Download
            </button>
          </div>
        </div>
      </div>
    `;
        }

        previewContainer.appendChild(previewItem);

        // Attach delete handler using event listener
        const deleteBtn = previewItem.querySelector(".emp-preview-delete-btn");
        if (deleteBtn) {
          deleteBtn.addEventListener("click", function () {
            const fileId = previewItem.getAttribute("data-file-id");
            const employeeId = previewItem.getAttribute("data-employee-id");
            const fileName = previewItem.getAttribute("data-file-name");

            deleteDocument(fileId, employeeId, fileName, this);
          });
        }
      });

      console.log("✅ Documents loaded into preview containers");
    } else {
      console.log("No documents to display");
    }
  } else {
    // CREATING NEW EMPLOYEE MODE

    // ✅ Change button text to "Add Employee"
    if (submitBtn) {
      submitBtn.textContent = "Add Employee";
    }

    // Show password section
    if (passwordSection) {
      passwordSection.style.display = "block";
    }

    // Make password fields required
    if (passwordInput) passwordInput.required = true;
    const confirmPasswordInput = document.getElementById("confirmPassword");
    if (confirmPasswordInput) confirmPasswordInput.required = true;

    console.log("Creating new employee - password fields shown");
  }
}

function setFieldValue(form, fieldName, value) {
  if (!form) return;
  const field = form.elements[fieldName];
  if (field && value) field.value = value;
}

// View Employee
window.viewEmployee = function (index) {
  console.log("View employee at index:", index);
  openModal(index);
};

// Delete Employee
window.deleteEmployee = function (index) {
  const emp = employeesData[index];
  if (!emp) return;

  // ✅ Use CommonModal for confirmation
  CommonModal.confirm(
    `Are you sure you want to delete employee "${emp.employee_name}"?\n\nThis action cannot be undone.`,
    "Delete Employee",
    function() {
      // User confirmed
      fetch(`${API_BASE}/delete.php`, {
        method: "POST",
        body: JSON.stringify({ employee_id: emp.employee_id }),
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Delete response:", data);
          if (data.success) {
            CommonModal.success("Employee deleted successfully!");
            fetchAndRenderEmployees();
          } else {
            CommonModal.error("Error deleting employee: " + (data.message || "Unknown error"), "Delete Error");
          }
        })
        .catch((err) => {
          console.error("Delete error:", err);
          CommonModal.error("Error deleting employee. Please try again.", "Network Error");
        });
    }
  );
};

// File preview setup
function setupFilePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  if (!input || !preview) return;

  input.addEventListener("change", function () {
    preview.innerHTML = "";

    if (this.files && this.files.length > 0) {
      Array.from(this.files).forEach((file) => {
        const previewItem = document.createElement("div");
        previewItem.className = "emp-preview-item";

        if (file.type.startsWith("image/")) {
          const img = document.createElement("img");
          img.className = "emp-preview-image";
          img.src = URL.createObjectURL(file);
          previewItem.appendChild(img);
        } else {
          const fileDiv = document.createElement("div");
          fileDiv.className = "emp-preview-file";
          fileDiv.innerHTML = `
              <span class="emp-preview-file-icon">📄</span>
              <span class="emp-preview-file-name">${file.name}</span>
            `;
          previewItem.appendChild(fileDiv);
        }

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "emp-preview-cancel";
        cancelBtn.innerHTML = "×";
        cancelBtn.type = "button";
        cancelBtn.onclick = function () {
          previewItem.remove();
          if (preview.children.length === 0) {
            input.value = "";
          }
        };

        previewItem.appendChild(cancelBtn);
        preview.appendChild(previewItem);
      });
    }
  });
}

// ===================================
// DELETE DOCUMENT FUNCTION
// ===================================

window.deleteDocument = function (
  fileId,
  employeeId,
  fileName,
  buttonElement
) {
  console.log("=== DELETE DOCUMENT DEBUG ===");
  console.log("fileId:", fileId, "type:", typeof fileId);
  console.log("employeeId:", employeeId, "type:", typeof employeeId);
  console.log("fileName:", fileName);

  if (!fileId || fileId === "undefined" || fileId === "null") {
    console.error("❌ Invalid fileId:", fileId);
    CommonModal.error("Invalid file ID: " + fileId, "Error");
    return;
  }

  if (!employeeId || employeeId === "undefined" || employeeId === "null") {
    console.error("❌ Invalid employeeId:", employeeId);
    CommonModal.error("Invalid employee ID: " + employeeId, "Error");
    return;
  }

  CommonModal.confirm(
    `Are you sure you want to delete "${fileName}"?\n\nThis action cannot be undone.`,
    "Delete Document",
    function () {
      console.log("✅ User confirmed deletion");

      const originalText = buttonElement.innerHTML;
      buttonElement.innerHTML = "⏳";
      buttonElement.disabled = true;

      const payload = {
        file_id: parseInt(fileId),
        employee_id: String(employeeId),
      };

      console.log("📤 Payload:", JSON.stringify(payload));

      fetch(`${API_BASE}/delete_document.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          console.log("Response status:", res.status);
          return res.json();
        })
        .then((data) => {
          console.log("📥 Delete response:", data);

          if (data.success) {
            CommonModal.success("Document deleted successfully!");

            const previewItem = buttonElement.closest(".emp-preview-item");
            if (previewItem) {
              previewItem.style.transition = "all 0.3s ease";
              previewItem.style.opacity = "0";
              previewItem.style.transform = "scale(0.8)";
              setTimeout(() => {
                previewItem.remove();
              }, 300);
            }

            fetchAndRenderEmployees();
          } else {
            CommonModal.error(
              "Error deleting document: " + (data.message || "Unknown error"),
              "Delete Error"
            );
            buttonElement.innerHTML = originalText;
            buttonElement.disabled = false;
          }
        })
        .catch((err) => {
          console.error("❌ Delete error:", err);
          CommonModal.error(
            "Error deleting document. Please try again.",
            "Network Error"
          );
          buttonElement.innerHTML = originalText;
          buttonElement.disabled = false;
        });
    }
  );
};

// View File Function
window.viewFile = function (fileUrl, fileName, fileType) {
  console.log("Opening file:", fileName, "Type:", fileType);

  const modal = document.getElementById("fileViewModal");
  const title = document.getElementById("fileViewTitle");
  const content = document.getElementById("fileViewContent");

  if (!modal || !title || !content) {
    console.error("File view modal elements not found");
    return;
  }

  title.textContent = fileName;
  content.innerHTML = "";

  if (fileType === "image") {
    const img = document.createElement("img");
    img.src = fileUrl;
    img.alt = fileName;
    img.style.maxWidth = "100%";
    img.style.maxHeight = "70vh";
    img.style.objectFit = "contain";
    img.onerror = function () {
      content.innerHTML =
        '<p style="color: #ef4444;">Failed to load image. <a href="' +
        fileUrl +
        '" target="_blank" style="color: #2563eb;">Open in new tab</a></p>';
    };
    content.appendChild(img);
  } else if (fileType === "pdf") {
    const iframe = document.createElement("iframe");
    iframe.src = fileUrl;
    iframe.style.width = "100%";
    iframe.style.height = "70vh";
    iframe.style.border = "none";
    iframe.onerror = function () {
      content.innerHTML =
        '<p style="color: #ef4444;">Failed to load PDF. <a href="' +
        fileUrl +
        '" target="_blank" style="color: #2563eb;">Open in new tab</a></p>';
    };
    content.appendChild(iframe);
  } else {
    content.innerHTML =
      '<p>Preview not available for this file type. <a href="' +
      fileUrl +
      '" target="_blank" style="color: #2563eb;">Open in new tab</a></p>';
  }

  modal.style.display = "block";
  document.body.style.overflow = "hidden";
};

// Close File View Modal
window.closeFileViewModal = function () {
  const modal = document.getElementById("fileViewModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
};

// Download File Function
window.downloadFile = function (fileUrl, fileName) {
  console.log("Downloading file:", fileName);

  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  a.target = "_blank";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// Close modal when clicking outside
window.onclick = function (event) {
  const fileViewModal = document.getElementById("fileViewModal");
  if (event.target === fileViewModal) {
    closeFileViewModal();
  }
};

// ===================================
// AUTO-CALCULATE INTERN DURATION
// ===================================

function setupDurationCalculation() {
  const internStartDateInput = document.getElementById("internStartDate");
  const internEndDateInput = document.getElementById("internEndDate");
  const durationMonthsInput = document.getElementById("durationMonths");

  if (!internStartDateInput || !internEndDateInput || !durationMonthsInput) {
    console.log("Duration calculation fields not found");
    return;
  }

  function calculateDuration() {
    const startDate = internStartDateInput.value;
    const endDate = internEndDateInput.value;

    console.log("Calculating duration:", { startDate, endDate });

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        durationMonthsInput.value = "";
        CommonModal.error("End date must be after start date", "Invalid Date");
        return;
      }

      // Calculate difference in months
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

      const totalMonths = months + 1;
      durationMonthsInput.value = totalMonths;

      console.log(`✅ Calculated duration: ${totalMonths} months`);
    } else {
      console.log("Start or end date missing");
    }
  }

  // Remove existing listeners to avoid duplicates
  internStartDateInput.removeEventListener("change", calculateDuration);
  internEndDateInput.removeEventListener("change", calculateDuration);

  // Add event listeners
  internStartDateInput.addEventListener("change", calculateDuration);
  internEndDateInput.addEventListener("change", calculateDuration);

  // ✅ Calculate immediately if both dates exist (for viewing existing employees)
  if (internStartDateInput.value && internEndDateInput.value) {
    calculateDuration();
  }

  console.log("✅ Duration calculation setup complete");
}

// ===================================
// DOM CONTENT LOADED
// ===================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("Employee form script loaded!");

  // Fetch and render employees on page load
  fetchAndRenderEmployees();

  // Add Employee button
  const addBtn = document.getElementById("addEmployeeBtn");
  if (addBtn) {
    console.log("Add button found");
    addBtn.addEventListener("click", () => {
      console.log("Add employee button clicked");
      openModal(null);
    });
  } else {
    console.error("Add button NOT found!");
  }

  // Close modal
  const closeBtn = document.querySelector(".emp-modal-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("employeeModal").style.display = "none";
      document.body.style.overflow = "auto";
    });
  }

  // Submit/Register Employee
  const submitBtn = document.getElementById("empSubmitBtn");
  if (submitBtn) {
    console.log("✓ Submit button found!");

    submitBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      console.log("=== SUBMIT BUTTON CLICKED ===");

      const empForm = document.getElementById("employeeForm");
      if (!empForm) {
        CommonModal.error("Form not found!", "Error");
        return;
      }

      console.log("✓ Form found");

      // Validate required fields
      const employeeId = empForm.elements["employeeId"]?.value;
      const employeeName = empForm.elements["employeeName"]?.value;
      const dob = empForm.elements["dob"]?.value;
      const password = empForm.elements["password"]?.value;
      const confirmPassword = empForm.elements["confirmPassword"]?.value;

      if (!employeeId) {
        CommonModal.error("Please enter Employee ID", "Validation Error");
        return;
      }

      if (!employeeName) {
        CommonModal.error("Please enter Employee Name", "Validation Error");
        return;
      }

      if (!dob) {
        CommonModal.error("Please enter Date of Birth", "Validation Error");
        return;
      }

      // Check password only for new employees
      if (currentEditingIndex === null) {
        if (!password) {
          CommonModal.error("Please enter Password", "Validation Error");
          return;
        }

        if (password !== confirmPassword) {
          CommonModal.error("Passwords do not match!", "Validation Error");
          return;
        }
      }

      console.log("✓ Validation passed");

      // Create FormData
      const formData = new FormData(empForm);

      // If editing, append edit flag
      if (currentEditingIndex !== null) {
        formData.append("edit", "1");
      }

      console.log("📤 Submitting to:", `${API_BASE}/register.php`);

      // Submit to backend
      fetch(`${API_BASE}/register.php`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          console.log("Response status:", response.status);
          if (!response.ok) {
            throw new Error("Network response was not ok: " + response.status);
          }
          return response.json();
        })
        .then((data) => {
          console.log("✓ Response data:", data);
          if (data.success) {
            const message = currentEditingIndex !== null 
              ? "Employee updated successfully!" 
              : "Employee registered successfully!";
            CommonModal.success(message);
            document.getElementById("employeeModal").style.display = "none";
            document.body.style.overflow = "auto";
            fetchAndRenderEmployees();
          } else {
            CommonModal.error(data.message || "Unknown error", "Error");
          }
        })
        .catch((err) => {
          console.error("❌ Submit error:", err);
          CommonModal.error("Error submitting form: " + err.message, "Network Error");
        });
    });
  } else {
    console.error("❌ Submit button NOT found!");
  }

  // Handle employment type toggle
  const onRoleRadio = document.getElementById("empOnRole");
  const internRadio = document.getElementById("empIntern");
  const onRoleFields = document.getElementById("onRoleFields");
  const internFields = document.getElementById("internFields");

  if (onRoleRadio && internRadio) {
    onRoleRadio.addEventListener("change", function () {
      if (this.checked && onRoleFields && internFields) {
        onRoleFields.style.display = "block";
        internFields.style.display = "none";
      }
    });

    internRadio.addEventListener("change", function () {
      if (this.checked && onRoleFields && internFields) {
        onRoleFields.style.display = "none";
        internFields.style.display = "block";

        // ✅ Setup duration calculation when intern is selected
        setTimeout(() => {
          setupDurationCalculation();
        }, 100);
      }
    });
  }

  // ✅ Setup duration calculation on page load
  setupDurationCalculation();

  // Password toggle
  const togglePassword = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");

  if (togglePassword && passwordField) {
    togglePassword.addEventListener("click", function () {
      const type = passwordField.type === "password" ? "text" : "password";
      passwordField.type = type;
    });
  }

  const toggleConfirmPassword = document.getElementById(
    "toggleConfirmPassword"
  );
  const confirmPasswordField = document.getElementById("confirmPassword");

  if (toggleConfirmPassword && confirmPasswordField) {
    toggleConfirmPassword.addEventListener("click", function () {
      const type =
        confirmPasswordField.type === "password" ? "text" : "password";
      confirmPasswordField.type = type;
    });
  }

  // File preview handlers
  setupFilePreview("employeePhoto", "preview-employeePhoto");
  setupFilePreview("resumeCV", "preview-resumeCV");
  setupFilePreview("idProof", "preview-idProof");
  setupFilePreview("certificates", "preview-certificates");
  setupFilePreview("otherDocs", "preview-otherDocs");

  console.log("✅ Employee management loaded successfully!");
});
