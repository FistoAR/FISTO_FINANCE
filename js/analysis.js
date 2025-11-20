// ===================================
// Analysis Page - Tab Switching
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            const targetContent = document.getElementById(tabName);

            // Check if target content exists
            if (!targetContent) {
                console.error(`Tab content with id "${tabName}" not found`);
                return;
            }

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            targetContent.classList.add('active');
        });
    });
});

// If using Astro View Transitions, wrap the code
if (document.querySelector('[name="astro-view-transitions-enabled"]')) {
    document.addEventListener('astro:after-swap', function() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                const targetContent = document.getElementById(tabName);

                if (!targetContent) return;

                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                this.classList.add('active');
                targetContent.classList.add('active');
            });
        });
    });
}
