// Dark Mode Toggle with Animation
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        showNotification('Dark mode enabled', 'success');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        showNotification('Light mode enabled', 'success');
    }
}

toggleSwitch.addEventListener('change', switchTheme);

// Session Time Tracking with Animation
let sessionStartTime = new Date();
function updateSessionTime() {
    const now = new Date();
    const diff = now - sessionStartTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const timeElement = document.getElementById('session-time');
    timeElement.innerHTML = `<i class="fas fa-clock"></i> Session Time: ${hours}h ${minutes}m ${seconds}s`;
    
    // Add pulse animation every minute
    if (seconds === 0) {
        timeElement.classList.add('pulse');
        setTimeout(() => timeElement.classList.remove('pulse'), 1000);
    }
}

setInterval(updateSessionTime, 1000);

// Profile Dropdown Toggle with Animation
const profileBtn = document.getElementById('profile-btn');
const profileDropdown = document.getElementById('profile-dropdown');

profileBtn.addEventListener('click', () => {
    profileDropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove('show');
    }
});

// Logout Functionality with Confirmation
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('studentRollNo');
        localStorage.removeItem('theme');
        showNotification('Logging out...', 'info');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }
});

// Help Button Toggle with Animation
const helpBtn = document.getElementById('help-btn');
const emailContainer = document.getElementById('email-container');

helpBtn.addEventListener('click', () => {
    emailContainer.classList.toggle('show');
});

// Close help dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!helpBtn.contains(e.target) && !emailContainer.contains(e.target)) {
        emailContainer.classList.remove('show');
    }
});

// Display Roll Number in Profile with Animation
const storedRollNo = localStorage.getItem('studentRollNo');
if (storedRollNo) {
    const profileRoll = document.getElementById('profile-roll');
    profileRoll.innerHTML = `<i class="fas fa-id-card"></i> Roll No: ${storedRollNo}`;
    profileRoll.style.animation = 'fadeIn 0.3s ease-out';
}

// Add this function to clear the form and results
function clearForm() {
    const formContainer = document.querySelector('.form-container');
    const seatResult = document.getElementById('seat-result');
    const regNoInput = document.getElementById('regNo');
    const clearBtn = document.querySelector('.clear-form');

    // Reset input
    regNoInput.value = '';
    regNoInput.classList.remove('valid');

    // Hide results
    seatResult.classList.remove('show');
    formContainer.classList.remove('expanded');
    clearBtn.classList.remove('show');

    // Reset result content
    const resultContent = document.querySelector('.result-content');
    resultContent.querySelectorAll('p').forEach(p => {
        p.innerHTML = p.innerHTML.split(':')[0] + ': ';
    });

    // Remove subject info if exists
    const subjectInfo = resultContent.querySelector('.subject-info');
    if (subjectInfo) {
        subjectInfo.remove();
    }
}

// Update form validation
function validateRollNumber(rollNo) {
    // Add your roll number validation pattern here
    const pattern = /^[0-9]{2}[A-Za-z]{2}[0-9A-Za-z]{2}[0-9]{4}$/;
    return pattern.test(rollNo);
}

// Update input validation handler
const regNoInput = document.getElementById('regNo');
regNoInput.addEventListener('input', (e) => {
    const value = e.target.value.trim().toUpperCase();
    e.target.value = value;
    
    const errorMessage = e.target.parentElement.querySelector('.error-message');
    if (!errorMessage) {
        const error = document.createElement('div');
        error.className = 'error-message';
        e.target.parentElement.appendChild(error);
    }

    if (value.length > 0) {
        if (validateRollNumber(value)) {
            e.target.classList.add('valid');
            e.target.classList.remove('invalid');
            errorMessage.classList.remove('show');
        } else {
            e.target.classList.add('invalid');
            e.target.classList.remove('valid');
            errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid roll number format';
            errorMessage.classList.add('show');
        }
    } else {
        e.target.classList.remove('valid', 'invalid');
        errorMessage.classList.remove('show');
    }
});

// Update assignSeat function with enhanced validation
async function assignSeat() {
    const regNo = document.getElementById('regNo').value.trim().toUpperCase();
    const seatResult = document.getElementById('seat-result');
    const formContainer = document.querySelector('.form-container');
    const clearBtn = document.querySelector('.clear-form');
    
    if (!regNo) {
        showNotification('Please enter your roll number', 'error');
        return;
    }

    if (!validateRollNumber(regNo)) {
        showNotification('Invalid roll number format', 'error');
        return;
    }

    try {
        // Show loading state with spinner
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.innerHTML = '<div class="spinner"></div> Finding Seat...';
        submitBtn.disabled = true;

        // Make the API call
        const response = await fetch(`http://localhost:5000/api/student-seat/${regNo}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch seat details');
        }

        const seatDetails = data.data;

        // Update the UI with seat details
        updateSeatDetails(seatDetails);
        
        // Show the result container and expand form with animation
        formContainer.classList.add('expanded');
        seatResult.classList.add('show');
        clearBtn.classList.add('show');
        
        showNotification('Seat found successfully!', 'success');

        // Don't update the profile roll number - keep the logged-in student's roll number
        const loggedInRollNo = localStorage.getItem('studentRollNo');
        const profileRoll = document.getElementById('profile-roll');
        profileRoll.innerHTML = `<i class="fas fa-id-card"></i> Roll No: ${loggedInRollNo}`;

    } catch (error) {
        console.error('Error:', error);
        showNotification('No seat found for this roll number. Please check and try again.', 'error');
        seatResult.classList.remove('show');
        formContainer.classList.remove('expanded');
        clearBtn.classList.remove('show');
    } finally {
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-search search-icon-animate"></i> Find My Seat';
        submitBtn.disabled = false;
    }
}

// Update the updateSeatDetails function to show simplified seat information
function updateSeatDetails(seatDetails) {
    const resultContent = document.querySelector('.result-content');
    
    // Main seat details with simplified display
    resultContent.innerHTML = `
        <div class="seat-info-main">
            <p id="block-info"><i class="fas fa-building"></i> Block: ${seatDetails.block}</p>
            <p id="room-info"><i class="fas fa-door-open"></i> Room: ${seatDetails.room}</p>
            <p id="seat-info"><i class="fas fa-chair"></i> Seat No: ${seatDetails.seat_no}</p>
            <p class="subject-info"><i class="fas fa-book"></i> Subject: ${seatDetails.subject}</p>
            <p class="branch-info"><i class="fas fa-code-branch"></i> Branch: ${seatDetails.branch || ''}</p>
        </div>
    `;
}

// Auto uppercase roll number input
document.getElementById('regNo').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
});

// Add smooth animations for form elements
document.addEventListener('DOMContentLoaded', () => {
    const formElements = document.querySelectorAll('.form-group, .submit-btn');
    formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.animation = `fadeIn 0.5s ease forwards ${index * 0.2}s`;
    });
});

// Enhanced Notification System with Animation
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                      type === 'error' ? 'fa-exclamation-circle' : 
                      'fa-info-circle'}"></i>
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

// Add notification styles with enhanced animations
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        background: var(--card-bg);
        color: var(--text-color);
        box-shadow: 0 3px 10px var(--shadow-color);
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1000;
        border: 1px solid var(--border-color);
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification.success {
        border-left: 3px solid #4CAF50;
    }

    .notification.error {
        border-left: 3px solid #f44336;
    }

    .notification.info {
        border-left: 3px solid #2196F3;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }

    .pulse {
        animation: pulse 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);

// Form Validation with Real-time Feedback
const form = document.getElementById('examForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    assignSeat();
});

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
