document.addEventListener("DOMContentLoaded", function () {
    const studentBtn = document.getElementById("student-btn");
    const adminBtn = document.getElementById("admin-btn");
    const studentForm = document.getElementById("student-form");
    const adminForm = document.getElementById("admin-form");
    const homeBtn = document.getElementById("home-btn"); // Home button

    // ✅ Home Button: Refresh the page
    if (homeBtn) {
        homeBtn.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.reload(); // Force reload
        });
    }

    // ✅ Toggle Login Forms
    studentBtn.addEventListener("click", () => {
        studentForm.classList.remove("hidden");
        adminForm.classList.add("hidden");
        studentBtn.classList.add("active");
        adminBtn.classList.remove("active");
    });

    adminBtn.addEventListener("click", () => {
        studentForm.classList.add("hidden");
        adminForm.classList.remove("hidden");
        studentBtn.classList.remove("active");
        adminBtn.classList.add("active");
    });

    // ✅ Student Login Handling
    studentForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        const submitBtn = this.querySelector('.login-btn');
        const rollNumInput = document.getElementById("student-rollnum");
        const dobInput = document.getElementById("student-dob");
        
        // Reset error states
        rollNumInput.classList.remove('error');
        dobInput.classList.remove('error');
        
        const rollNum = rollNumInput.value.trim();
        const studentDob = dobInput.value.trim();

        if (!rollNum || !studentDob) {
            if (!rollNum) rollNumInput.classList.add('error');
            if (!studentDob) dobInput.classList.add('error');
            showError("Please enter your Roll Number and Date of Birth!");
            return;
        }

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;

            const response = await fetch("http://localhost:5000/api/auth/student", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    roll_no: rollNum.toUpperCase(), // Convert to uppercase before sending
                    date_of_birth: studentDob 
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("studentRollNo", rollNum.toUpperCase());
                window.location.href = data.redirect;
            } else {
                rollNumInput.classList.add('error');
                dobInput.classList.add('error');
                showError(data.message);
            }
        } catch (error) {
            console.error("❌ Student login error:", error);
            showError("Server error. Try again later.");
        } finally {
            // Reset button state
            submitBtn.innerHTML = 'Login';
            submitBtn.disabled = false;
        }
    });

    // ✅ Admin Login Handling
    adminForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const adminUsername = document.getElementById("admin-username").value.trim();
        const adminPassword = document.getElementById("admin-pass").value.trim();

        if (!adminUsername || !adminPassword) {
            alert("Enter Admin Username and Password!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: adminUsername, password: adminPassword })
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = data.redirect; // Redirect to admin panel
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("❌ Admin login error:", error);
            alert("Server error. Try again later.");
        }
    });
});

// Add this helper function for showing errors
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Insert error message after the form
    const form = document.querySelector('.login-box');
    form.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}
