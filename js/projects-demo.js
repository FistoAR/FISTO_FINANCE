/* ========================================
   DEMOS WITH ACTUAL FILE UPLOAD
   ======================================== */

// API Configuration
const API_BASE_URL = 'https://www.fist-o.com/fisto_finance_app/api/demos';

// Global state
let demos = [];
let currentDemo = null;
let editingIndex = null;
let editingDemoId = null;
let linkFiles = [];
let uploadFiles = [];

// ===================================
// LOAD DEMOS FROM DATABASE
// ===================================
async function loadDemos() {
    try {
        const response = await fetch(`${API_BASE_URL}/fetch.php`);
        const result = await response.json();
        
        if (result.success) {
            demos = result.data;
            renderTable();
            console.log('✅ Demos loaded from database:', demos);
        } else {
            console.error('❌ Failed to load demos:', result.message);
            // ✅ ADDED: Error notification
            CommonModal.error(`Failed to load demos: ${result.message}`, 'Load Error');
        }
    } catch (error) {
        console.error('❌ Error loading demos:', error);
        // ✅ ADDED: Error notification
        CommonModal.error('Failed to connect to server. Please check your connection.', 'Connection Error');
    }
}

// Open Add Modal
function openAddModal() {
    currentDemo = null;
    editingIndex = null;
    editingDemoId = null;
    document.getElementById('modalTitle').textContent = 'Add Demo';
    document.getElementById('saveBtn').textContent = 'Save';
    resetForm();
    document.getElementById('modalOverlay').classList.add('active');
}

// Open View/Edit Modal
function openViewEditModal(index) {
    editingIndex = index;
    currentDemo = demos[index];
    editingDemoId = currentDemo.id;
    
    document.getElementById('modalTitle').textContent = 'View / Edit Demo';
    document.getElementById('saveBtn').textContent = 'Update';
    
    document.getElementById('projectName').value = currentDemo.name;
    document.getElementById('projectCategory').value = currentDemo.category;
    
    linkFiles = currentDemo.files.filter(f => f.isLink).map(f => ({...f}));
    uploadFiles = currentDemo.files.filter(f => !f.isLink).map(f => ({...f}));
    
    renderLinkFiles();
    renderUploadFiles();
    
    document.getElementById('modalOverlay').classList.add('active');
}

// Close Modal
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    resetForm();
}

function closeModalOnOverlay(event) {
    if (event.target === event.currentTarget) {
        closeModal();
    }
}

// Reset Form
function resetForm() {
    document.getElementById('demoForm').reset();
    linkFiles = [];
    uploadFiles = [];
    currentDemo = null;
    editingIndex = null;
    editingDemoId = null;
    renderLinkFiles();
    renderUploadFiles();
    resetUploadArea();
}

// Reset upload area
function resetUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        const span = uploadArea.querySelector('span');
        if (span) {
            span.textContent = 'Drag & drop your files here or click to browse';
        }
        uploadArea.style.borderColor = '#9CC4FF';
        uploadArea.style.background = 'white';
    }
}

// Add Link File
function addLinkFile() {
    const type = document.getElementById('fileTypeSelect').value;
    const name = document.getElementById('fileName').value;
    const link = document.getElementById('fileLink').value;

    // ✅ REPLACED: alert with CommonModal
    if (!type || !name || !link) {
        CommonModal.error('Please fill in all fields for the link file', 'Validation Error');
        return;
    }

    // ✅ ADDED: URL validation
    try {
        new URL(link);
    } catch (e) {
        CommonModal.error('Please enter a valid URL (e.g., https://example.com)', 'Invalid URL');
        return;
    }

    linkFiles.push({
        type,
        name,
        value: link,
        isLink: true
    });

    document.getElementById('fileTypeSelect').value = '';
    document.getElementById('fileName').value = '';
    document.getElementById('fileLink').value = '';

    renderLinkFiles();
    
    // ✅ ADDED: Success feedback
    CommonModal.success('Link file added successfully!');
}

// ===================================
// ADD UPLOAD FILE - WITH ACTUAL UPLOAD
// ===================================
async function addUploadFile() {
    const type = document.getElementById('uploadFileTypeSelect').value;
    const name = document.getElementById('uploadFileName').value;
    const fileInput = document.getElementById('fileUploadInput');
    const file = fileInput.files[0];

    // ✅ REPLACED: alert with CommonModal
    if (!type || !name || !file) {
        CommonModal.error('Please fill in all fields and select a file', 'Validation Error');
        return;
    }

    // ✅ ADDED: File size validation (e.g., max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        CommonModal.error('File size exceeds 50MB limit. Please choose a smaller file.', 'File Too Large');
        return;
    }

    // ✅ ADDED: File type validation
    const allowedTypes = {
        'video': ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
        'pdf': ['application/pdf']
    };

    if (allowedTypes[type] && !allowedTypes[type].includes(file.type)) {
        CommonModal.error(`Please select a valid ${type.toUpperCase()} file`, 'Invalid File Type');
        return;
    }

    // Show uploading message
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Uploading...';
    saveBtn.disabled = true;

    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', type);

        // Upload file to server
        const response = await fetch(`${API_BASE_URL}/upload.php`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Add uploaded file info to array
            uploadFiles.push({
                type,
                name,
                value: result.filePath, // Store server path
                originalName: result.originalName,
                uniqueName: result.fileName,
                isLink: false
            });

            // Reset inputs
            document.getElementById('uploadFileTypeSelect').value = '';
            document.getElementById('uploadFileName').value = '';
            fileInput.value = '';
            resetUploadArea();

            renderUploadFiles();
            
            // ✅ REPLACED: alert with CommonModal
            CommonModal.success('File uploaded successfully!');
        } else {
            // ✅ REPLACED: alert with CommonModal
            CommonModal.error(`Upload failed: ${result.message}`, 'Upload Error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        // ✅ REPLACED: alert with CommonModal
        CommonModal.error('Error uploading file. Please check your connection and try again.', 'Upload Error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// Handle File Upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    const uploadArea = document.getElementById('uploadArea');
    
    if (file && uploadArea) {
        const span = uploadArea.querySelector('span');
        if (span) {
            span.textContent = `✓ ${file.name}`;
            uploadArea.style.borderColor = '#2D6BFF';
            uploadArea.style.background = '#f0f7ff';
        }
    }
}

// Render Link Files
function renderLinkFiles() {
    const tbody = document.getElementById('linkFilesTableBody');
    const inputRow = tbody.querySelector('.input-row');
    tbody.innerHTML = '';
    
    linkFiles.forEach((file, index) => {
        const typeLabels = {
            'figma': 'Figma',
            'git': 'Git',
            'live': 'Live'
        };

        const row = document.createElement('tr');
        row.className = 'file-data-row';
        row.innerHTML = `
            <td><span class="file-type-badge">${typeLabels[file.type]}</span></td>
            <td>${file.name}</td>
            <td>
                <div class="file-data-cell">
                    <span class="file-link-text" onclick="openLink('${file.value}')" title="${file.value}">${file.value}</span>
                    <button type="button" class="btn-delete-row" onclick="removeLinkFile(${index})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    tbody.appendChild(inputRow);
}

// Render Upload Files
function renderUploadFiles() {
    const tbody = document.getElementById('uploadFilesTableBody');
    const inputRow = tbody.querySelector('.input-row');
    tbody.innerHTML = '';
    
    uploadFiles.forEach((file, index) => {
        const typeLabels = {
            'video': 'Video',
            'pdf': 'PDF'
        };

        // ✅ Icons for different file types
        const icons = {
            'video': "/FISTO_FINANCE/assets/images/video_icon.webp',
            'pdf': "/FISTO_FINANCE/assets/images/PDF_icon.webp'
        };

        const displayName = file.originalName || file.uniqueName || file.value;
        const fileIcon = icons[file.type] || "/FISTO_FINANCE/assets/images/file-icon.png';

        const row = document.createElement('tr');
        row.className = 'file-data-row';
        row.innerHTML = `
            <td><span class="file-type-badge">${typeLabels[file.type]}</span></td>
            <td>${file.name}</td>
            <td>
                <div class="file-data-cell">
                    <button type="button" class="btn-view-file" onclick="viewUploadedFile('${file.value}')" title="${displayName}">
                        <img src="${fileIcon}" alt="${file.type}" class="file-icon" />
                        <span>View</span>
                    </button>
                    <button type="button" class="btn-delete-row" onclick="removeUploadFile(${index})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    tbody.appendChild(inputRow);
}

// Remove Files
function removeLinkFile(index) {
    // ✅ ADDED: Confirmation before removing
    const file = linkFiles[index];
    CommonModal.confirm(
        `Are you sure you want to remove "${file.name}"?`,
        'Remove Link File',
        function() {
            linkFiles.splice(index, 1);
            renderLinkFiles();
            CommonModal.success('Link file removed');
        }
    );
}

function removeUploadFile(index) {
    // ✅ ADDED: Confirmation before removing
    const file = uploadFiles[index];
    CommonModal.confirm(
        `Are you sure you want to remove "${file.name}"?`,
        'Remove Uploaded File',
        function() {
            uploadFiles.splice(index, 1);
            renderUploadFiles();
            CommonModal.success('Uploaded file removed');
        }
    );
}

// Open Link
function openLink(url) {
    window.open(url, '_blank');
}

// View Uploaded File
function viewUploadedFile(filePath) {
    const fullPath = `https://www.fist-o.com/fisto_finance_app/${filePath}`;
    window.open(fullPath, '_blank');
}

// ===================================
// SAVE DEMO TO DATABASE
// ===================================
async function saveDemo() {
    const name = document.getElementById('projectName').value;
    const category = document.getElementById('projectCategory').value;

    // ✅ REPLACED: alert with CommonModal
    if (!name || !category) {
        CommonModal.error('Please fill in Project Name and Category', 'Validation Error');
        return;
    }

    // ✅ ADDED: Validation for name length
    if (name.trim().length < 3) {
        CommonModal.error('Project name must be at least 3 characters long', 'Validation Error');
        return;
    }

    if (linkFiles.length === 0 && uploadFiles.length === 0) {
        CommonModal.error('Please add at least one file (link or upload)', 'Validation Error');
        return;
    }

    const date = new Date().toISOString().split('T')[0];
    const allFiles = [...linkFiles, ...uploadFiles];

    const demoData = {
        projectName: name,
        projectCategory: category,
        date: date,
        files: allFiles
    };

    if (editingDemoId) {
        demoData.demoId = editingDemoId;
    }

    // ✅ ADDED: Show loading state
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/save.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(demoData)
        });

        const result = await response.json();

        if (result.success) {
            // ✅ REPLACED: alert with CommonModal
            CommonModal.success(result.message || (editingDemoId ? 'Demo updated successfully!' : 'Demo added successfully!'));
            closeModal();
            loadDemos();
        } else {
            // ✅ REPLACED: alert with CommonModal
            CommonModal.error(`Error: ${result.message}`, 'Save Error');
        }
    } catch (error) {
        console.error('Error saving demo:', error);
        // ✅ REPLACED: alert with CommonModal
        CommonModal.error('Error saving demo. Please check your connection and try again.', 'Save Error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// ===================================
// DELETE DEMO FROM DATABASE
// ===================================
async function deleteDemo(index) {
    const demo = demos[index];
    const demoId = demo.id;

    // ✅ REPLACED: confirm with CommonModal.confirm
    CommonModal.confirm(
        `Are you sure you want to delete "${demo.name}"? This action cannot be undone.`,
        'Delete Demo',
        async function() {
            // User confirmed - proceed with deletion
            try {
                const response = await fetch(`${API_BASE_URL}/delete.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ demoId: demoId })
                });

                const result = await response.json();

                if (result.success) {
                    // ✅ REPLACED: alert with CommonModal
                    CommonModal.success(result.message || 'Demo deleted successfully!');
                    loadDemos();
                } else {
                    // ✅ REPLACED: alert with CommonModal
                    CommonModal.error(`Error: ${result.message}`, 'Delete Error');
                }
            } catch (error) {
                console.error('Error deleting demo:', error);
                // ✅ REPLACED: alert with CommonModal
                CommonModal.error('Error deleting demo. Please check your connection and try again.', 'Delete Error');
            }
        }
        // onCancel is optional - do nothing if cancelled
    );
}

// Render Table
function renderTable() {
    const tbody = document.getElementById('demosTableBody');
    
    if (tbody.querySelector('td[colspan]')) {
        tbody.innerHTML = '';
    }
    
    if (demos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
                    No demos added yet. Click "Add Demo" to get started.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = demos.map((demo, index) => `
        <tr>
            <td>${String(index + 1).padStart(2, '0')}</td>
            <td>${demo.date}</td>
            <td>${demo.name}</td>
            <td>${demo.category}</td>
            <td>
                <button class="action-btn action-btn-edit" onclick="openViewEditModal(${index})">
                  <img src="/FISTO_FINANCE/assets/images/tabler_eye_icon.webp" alt="view icon">
                </button>
            </td>
            <td>
                <button class="action-btn action-btn-delete" onclick="deleteDemo(${index})">
                  <img src="/FISTO_FINANCE/assets/images/tabler_delete_icon.webp" alt="delete icon">
                </button>
            </td>
        </tr>
    `).join('');
}

// Drag and Drop
const uploadArea = document.getElementById('uploadArea');

if (uploadArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('drag-over');
        }, false);
    });

    uploadArea.addEventListener('drop', e => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const fileInput = document.getElementById('fileUploadInput');
            fileInput.files = files;
            handleFileUpload({ target: fileInput });
        }
    }, false);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadDemos();
    console.log('🚀 Demos with file upload loaded!');
});
