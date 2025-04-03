document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input, textarea');
    const submitBtn = form.querySelector('.submit-btn');

    // Add input validation and styling
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });

        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });

    // Form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Validate all inputs
        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            showNotification('Please fill in all fields correctly.', 'error');
            return;
        }

        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            const recipientEmail = "bonthavijay1807@gmail.com";
            const mailSubject = `New Contact Form Submission: ${formData.subject}`;
            const mailBody = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;

            window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

            // Reset form
            form.reset();
            showNotification('Message sent successfully!', 'success');
            
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
        }, 1500);
    });

    // Input validation function
    function validateInput(input) {
        const value = input.value.trim();
        const wrapper = input.parentElement;
        const icon = wrapper.querySelector('i');
        let isValid = true;

        // Remove existing error/success classes
        wrapper.classList.remove('error', 'success');
        icon.classList.remove('fa-check-circle', 'fa-exclamation-circle');

        // Validate based on input type
        if (input.required && !value) {
            isValid = false;
            wrapper.classList.add('error');
            icon.classList.add('fa-exclamation-circle');
            showError(input, 'This field is required');
        } else if (input.type === 'email' && !isValidEmail(value)) {
            isValid = false;
            wrapper.classList.add('error');
            icon.classList.add('fa-exclamation-circle');
            showError(input, 'Please enter a valid email address');
        } else if (value) {
            wrapper.classList.add('success');
            icon.classList.add('fa-check-circle');
            hideError(input);
        }

        return isValid;
    }

    // Email validation helper
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Error message display
    function showError(input, message) {
        const wrapper = input.parentElement;
        let errorDiv = wrapper.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            wrapper.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
    }

    function hideError(input) {
        const wrapper = input.parentElement;
        const errorDiv = wrapper.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Notification system
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});
