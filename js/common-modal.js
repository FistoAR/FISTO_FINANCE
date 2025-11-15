// ===================================
// ENHANCED MODAL SYSTEM - JavaScript (FIXED)
// Toast notifications + Themed modals
// ===================================

const CommonModal = {
    // Success Toast (Top Right Slide-in) - FIXED
    success: function(message, title = 'Success!', duration = 3000, callback = null) {
        const toast = document.getElementById('commonSuccessToast');
        const titleEl = document.getElementById('commonSuccessToastTitle');
        const messageEl = document.getElementById('commonSuccessToastMessage');
        const closeBtn = document.getElementById('commonSuccessToastClose');

        if (!toast) {
            console.error('CommonSuccessToast not found!');
            alert(message);
            if (callback) callback();
            return;
        }

        // Update content
        titleEl.textContent = title;
        messageEl.textContent = message;

        // Reset toast state (critical fix)
        toast.classList.remove('show');
        toast.style.display = 'none';

        // Force repaint by using setTimeout
        setTimeout(() => {
            toast.style.display = 'block';
            // Use another timeout to trigger the animation
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
        }, 10);

        // Auto-hide after duration
        const autoHideTimeout = setTimeout(() => {
            this.hideToast(toast, callback);
        }, duration);

        // Close button handler
        const closeHandler = () => {
            clearTimeout(autoHideTimeout);
            this.hideToast(toast, callback);
            closeBtn.removeEventListener('click', closeHandler);
        };

        closeBtn.addEventListener('click', closeHandler);
    },

    // Error Toast (Top Right Slide-in) - FIXED
    error: function(message, title = 'Error!', duration = 4000, callback = null) {
        const toast = document.getElementById('commonErrorToast');
        const titleEl = document.getElementById('commonErrorToastTitle');
        const messageEl = document.getElementById('commonErrorToastMessage');
        const closeBtn = document.getElementById('commonErrorToastClose');

        if (!toast) {
            console.error('CommonErrorToast not found!');
            alert(message);
            if (callback) callback();
            return;
        }

        // Update content
        titleEl.textContent = title;
        messageEl.textContent = message;

        // Reset toast state (critical fix)
        toast.classList.remove('show');
        toast.style.display = 'none';

        // Force repaint by using setTimeout
        setTimeout(() => {
            toast.style.display = 'block';
            // Use another timeout to trigger the animation
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
        }, 10);

        // Auto-hide after duration
        const autoHideTimeout = setTimeout(() => {
            this.hideToast(toast, callback);
        }, duration);

        // Close button handler
        const closeHandler = () => {
            clearTimeout(autoHideTimeout);
            this.hideToast(toast, callback);
            closeBtn.removeEventListener('click', closeHandler);
        };

        closeBtn.addEventListener('click', closeHandler);
    },

    // Hide toast helper
    hideToast: function(toast, callback) {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.style.display = 'none';
            if (callback) callback();
        }, 500); // Match CSS transition duration
    },

    // Info/Alert/Warning Modal (Center)
    alert: function(message, title = 'Alert', callback = null) {
        const modal = document.getElementById('commonAlertModal');
        const icon = document.getElementById('commonAlertIcon');
        const titleEl = document.getElementById('commonAlertTitle');
        const messageEl = document.getElementById('commonAlertMessage');
        const okBtn = document.getElementById('commonAlertOkBtn');

        if (!modal) {
            console.error('CommonAlertModal not found!');
            alert(message);
            if (callback) callback();
            return;
        }

        icon.src = "/FISTO_FINANCE/assets/images/info_icon.webp';
        icon.alt = 'Info';
        titleEl.textContent = title;
        titleEl.style.color = '#2D6BFF';
        messageEl.textContent = message;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const closeHandler = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            okBtn.removeEventListener('click', closeHandler);
            modal.removeEventListener('click', outsideClickHandler);
            document.removeEventListener('keydown', escapeHandler);
            if (callback) callback();
        };

        const outsideClickHandler = (e) => {
            if (e.target === modal) closeHandler();
        };

        const escapeHandler = (e) => {
            if (e.key === 'Escape') closeHandler();
        };

        okBtn.addEventListener('click', closeHandler);
        modal.addEventListener('click', outsideClickHandler);
        document.addEventListener('keydown', escapeHandler);
    },

    // Warning Modal
    warning: function(message, title = 'Warning!', callback = null) {
        const modal = document.getElementById('commonAlertModal');
        const icon = document.getElementById('commonAlertIcon');
        const titleEl = document.getElementById('commonAlertTitle');
        const messageEl = document.getElementById('commonAlertMessage');
        const okBtn = document.getElementById('commonAlertOkBtn');

        if (!modal) {
            console.error('CommonAlertModal not found!');
            alert(message);
            if (callback) callback();
            return;
        }

        icon.src = "/FISTO_FINANCE/assets/images/warning_icon.webp';
        icon.alt = 'Warning';
        titleEl.textContent = title;
        titleEl.style.color = '#f59e0b';
        messageEl.textContent = message;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const closeHandler = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            okBtn.removeEventListener('click', closeHandler);
            modal.removeEventListener('click', outsideClickHandler);
            document.removeEventListener('keydown', escapeHandler);
            if (callback) callback();
        };

        const outsideClickHandler = (e) => {
            if (e.target === modal) closeHandler();
        };

        const escapeHandler = (e) => {
            if (e.key === 'Escape') closeHandler();
        };

        okBtn.addEventListener('click', closeHandler);
        modal.addEventListener('click', outsideClickHandler);
        document.addEventListener('keydown', escapeHandler);
    },

    // Confirmation Modal (Blue Theme)
    confirm: function(message, title = 'Confirm Action', onConfirm = null, onCancel = null) {
        const modal = document.getElementById('commonConfirmModal');
        const titleEl = document.getElementById('commonConfirmTitle');
        const messageEl = document.getElementById('commonConfirmMessage');
        const confirmBtn = document.getElementById('commonConfirmOkBtn');
        const cancelBtn = document.getElementById('commonConfirmCancelBtn');
        const closeX = document.getElementById('commonConfirmCloseX');

        if (!modal) {
            console.error('CommonConfirmModal not found!');
            const result = confirm(message);
            if (result && onConfirm) onConfirm();
            if (!result && onCancel) onCancel();
            return;
        }

        titleEl.textContent = title;
        messageEl.textContent = message;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const confirmHandler = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            confirmBtn.removeEventListener('click', confirmHandler);
            cancelBtn.removeEventListener('click', cancelHandler);
            closeX.removeEventListener('click', cancelHandler);
            modal.removeEventListener('click', outsideClickHandler);
            document.removeEventListener('keydown', escapeHandler);
            if (onConfirm) onConfirm();
        };

        const cancelHandler = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            confirmBtn.removeEventListener('click', confirmHandler);
            cancelBtn.removeEventListener('click', cancelHandler);
            closeX.removeEventListener('click', cancelHandler);
            modal.removeEventListener('click', outsideClickHandler);
            document.removeEventListener('keydown', escapeHandler);
            if (onCancel) onCancel();
        };

        const outsideClickHandler = (e) => {
            if (e.target === modal) cancelHandler();
        };

        const escapeHandler = (e) => {
            if (e.key === 'Escape') cancelHandler();
        };

        confirmBtn.addEventListener('click', confirmHandler);
        cancelBtn.addEventListener('click', cancelHandler);
        closeX.addEventListener('click', cancelHandler);
        modal.addEventListener('click', outsideClickHandler);
        document.addEventListener('keydown', escapeHandler);
    }
};

// Make globally available
window.CommonModal = CommonModal;

console.log('✅ Enhanced Common Modal System loaded successfully!');
