document.addEventListener("DOMContentLoaded", function () {
    const blockSelect = document.getElementById("block");
    const totalRoomsInput = document.getElementById("totalRooms");
    const generateRoomsBtn = document.getElementById("generateRooms");
    const roomsContainer = document.getElementById("roomsContainer");
    const generateSummaryBtn = document.getElementById("generateSummary");
    const loadSeatingBtn = document.getElementById("loadSeatingBtn");
    const exportCSVBtn = document.getElementById("exportCSVBtn");
    const seatingTable = document.getElementById("seatingTable").querySelector("tbody");
    const branchSelect = document.getElementById("branchSelect");
    const studentsTable = document.getElementById("studentsTable").querySelector("tbody");
    const previewRoomBtn = document.getElementById("previewRoomBtn");
    const roomPreviewModal = document.getElementById("roomPreviewModal");
    const roomPreviewContainer = document.getElementById("roomPreviewContainer");
    const closePreviewBtn = roomPreviewModal.querySelector(".close-btn");

    const roomNumbers = ["101", "102", "103", "104", "105", "106", "201", "202", "203", "204", "205", "206","301", "302", "303", "304", "305", "306","401", "402", "403", "404", "405", "406"];
    const siemensRooms = [...roomNumbers, "501", "502", "503", "504"];
    const branches = ["CSE", "AID", "AIML", "IT", "CIC", "CSO", "CSM", "ECE", "EEE", "MECH", "CIVIL"];

const subjects = {
    "CSE": [
        "Data Structures", "Algorithms", "Operating Systems", 
        "Database Management Systems", "Computer Networks", "Software Engineering"
    ],
    "AID": [
        "AI Basics", "Data Science", "Neural Networks", 
        "Big Data Analytics", "Natural Language Processing", "AI in Healthcare"
    ],
    "AIML": [
        "Machine Learning", "Deep Learning", "AI Ethics", 
        "Reinforcement Learning", "Computer Vision", "Explainable AI"
    ],
    "IT": [
        "Web Technologies", "Cloud Computing", "Cyber Security", 
        "Blockchain Technology", "Software Testing", "Mobile App Development"
    ],
    "CIC": [
        "Cryptography", "Cyber Forensics", "Ethical Hacking", 
        "Digital Security", "IoT Security", "Network Defense"
    ],
    "CSO": [
        "Operating System Internals", "Embedded Systems", "Cybersecurity Protocols",
        "Real-Time Systems", "IoT and Edge Computing", "Network Security"
    ],
    "CSM": [
        "Big Data Technologies", "Cloud Computing", "Software Development Practices", 
        "Agile Methodologies", "DevOps Fundamentals", "Microservices Architecture"
    ],
    "ECE": [
        "Digital Circuits", "Microprocessors", "Signal Processing", 
        "VLSI Design", "Embedded Systems", "Wireless Communication"
    ],
    "EEE": [
        "Power Systems", "Control Systems", "Electrical Machines", 
        "High Voltage Engineering", "Renewable Energy Systems", "Smart Grid Technologies"
    ],
    "MECH": [
        "Thermodynamics", "Fluid Mechanics", "Machine Design", 
        "Automobile Engineering", "Robotics", "3D Printing and CAD/CAM"
    ],
    "CIVIL": [
        "Structural Analysis", "Geotechnical Engineering", "Concrete Technology", 
        "Transportation Engineering", "Environmental Engineering", "Construction Management"
    ]
};

    let finalSeatingData = [];

    // Update the branch mapping in your script
    const branchMapping = {
        "AIDS": "AID",
        "INF": "IT",
        // ... keep other mappings the same
    };

    // Add this function to convert UI branch names to DB branch names
    function convertBranchName(uiBranch, reverse = false) {
        if (reverse) {
            // Convert DB name to UI name
            return Object.entries(branchMapping).find(([ui, db]) => db === uiBranch)?.[0] || uiBranch;
        }
        // Convert UI name to DB name
        return branchMapping[uiBranch] || uiBranch;
    }

    // Function to load data from database
    async function loadDataFromDatabase() {
        try {
            const response = await fetch('http://localhost:5000/api/seating-data');
            const data = await response.json();
            
            if (data.success) {
                seatingTable.innerHTML = "";
                
                // Sort the data by room and seat number
                const sortedData = data.data.sort((a, b) => {
                    if (a.room !== b.room) return a.room.localeCompare(b.room);
                    return a.seat_no - b.seat_no;
                });

                sortedData.forEach(record => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${record.roll_no || 'N/A'}</td>
                        <td>${record.block || 'N/A'}</td>
                        <td>${record.room || 'N/A'}</td>
                        <td>${record.seat_no || 'N/A'}</td>
                        <td>${record.branch || 'N/A'}</td>
                        <td>${record.subject || 'N/A'}</td>
                    `;
                    seatingTable.appendChild(row);
                });
                
                finalSeatingData = sortedData;
            } else {
                console.error('Error loading data:', data.message);
                seatingTable.innerHTML = `<tr><td colspan="6" class="error">Error: ${data.message}</td></tr>`;
            }
        } catch (error) {
            console.error('Error:', error);
            seatingTable.innerHTML = `<tr><td colspan="6" class="error">Failed to load seating data</td></tr>`;
        }
    }

    // Function to load students by branch
    async function loadStudentsByBranch(branch) {
        if (!branch) {
            studentsTable.innerHTML = "";
            return;
        }

        try {
            const dbBranch = convertBranchName(branch);
            const response = await fetch(`http://localhost:5000/api/students/${dbBranch}`);
            const data = await response.json();
            
            if (data.success) {
                studentsTable.innerHTML = "";
                
                // Sort by roll number
                const sortedStudents = data.data.sort((a, b) => 
                    a.roll_no.localeCompare(b.roll_no)
                );

                sortedStudents.forEach(student => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${student.roll_no || 'N/A'}</td>
                        <td>${student.branch || 'N/A'}</td>
                        <td>${student.room || 'Not Assigned'}</td>
                        <td>${student.seat_no || 'Not Assigned'}</td>
                        <td>${student.subject || 'Not Assigned'}</td>
                    `;
                    studentsTable.appendChild(row);
                });
            } else {
                console.error('Error loading students:', data.message);
                studentsTable.innerHTML = `<tr><td colspan="5" class="error">Error: ${data.message}</td></tr>`;
            }
        } catch (error) {
            console.error('Error:', error);
            studentsTable.innerHTML = `<tr><td colspan="5" class="error">Failed to load student data</td></tr>`;
        }
    }

    // Load data when page loads
    loadDataFromDatabase();

    // Add these functions at the beginning of your DOMContentLoaded event
    function showLoading(button) {
        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="spinner"></span> Processing...';
        return originalContent;
    }

    function hideLoading(button, originalContent) {
        button.disabled = false;
        button.innerHTML = originalContent;
    }

    // Auto-fill rooms based on block selection
    blockSelect.addEventListener('change', function() {
        const selectedBlock = this.value;
        let defaultRooms = 6; // Default number of rooms

        switch(selectedBlock) {
            case 'Siemens':
                defaultRooms = 8;
                break;
            case 'Main':
                defaultRooms = 10;
                break;
            // Add more cases as needed
        }

        totalRoomsInput.value = defaultRooms;
    });

    // Validate room number input
    totalRoomsInput.addEventListener('input', function() {
        const value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
            this.classList.add('invalid');
            generateRoomsBtn.disabled = true;
        } else {
            this.classList.remove('invalid');
            generateRoomsBtn.disabled = false;
        }
    });

    // Update Generate Rooms button click handler
    generateRoomsBtn.addEventListener("click", async function () {
        const originalContent = showLoading(this);
        
        try {
        const totalRooms = parseInt(totalRoomsInput.value);
        if (isNaN(totalRooms) || totalRooms < 1) {
                throw new Error("Please enter a valid number of rooms.");
        }

        roomsContainer.innerHTML = "";

        for (let i = 0; i < totalRooms; i++) {
            const roomDiv = document.createElement("div");
            roomDiv.classList.add("room-section");

                const availableRooms = blockSelect.value === "Siemens" ? siemensRooms : roomNumbers;

            roomDiv.innerHTML = `
                <h3>Room ${i + 1}</h3>
                <label>Room Number:</label>
                <select class="room-number">
                    ${availableRooms.map(num => `<option value="${num}">${num}</option>`).join("")}
                </select>

                <label>Room Capacity:</label>
                <input type="number" class="room-capacity" min="1" max="100" required>

                <div class="branches-container"></div>
                <button class="add-branch">Add Branch</button>
            `;

            roomsContainer.appendChild(roomDiv);

            const addBranchBtn = roomDiv.querySelector(".add-branch");
            const branchesContainer = roomDiv.querySelector(".branches-container");

            addBranchBtn.addEventListener("click", function () {
                if (branchesContainer.children.length >= 4) {
                    alert("Maximum 4 branches per room.");
                    return;
                }

                const branchDiv = document.createElement("div");
                branchDiv.classList.add("branch-section");
                branchDiv.innerHTML = `
                    <label>Branch:</label>
                    <select class="branch-name">
                        ${branches.map(branch => `<option value="${branch}">${branch}</option>`).join("")}
                    </select>

                    <label>Subject:</label>
                    <select class="subject-name"></select>

                    <label>Students:</label>
                    <input type="number" class="students-count" min="1" required>

                    <button class="remove-branch">Remove</button>
                `;

                branchesContainer.appendChild(branchDiv);

                const subjectSelect = branchDiv.querySelector(".subject-name");
                const branchSelect = branchDiv.querySelector(".branch-name");

                function updateSubjects() {
                    subjectSelect.innerHTML = subjects[branchSelect.value].map(sub => `<option value="${sub}">${sub}</option>`).join("");
                }

                branchSelect.addEventListener("change", updateSubjects);
                updateSubjects();

                branchDiv.querySelector(".remove-branch").addEventListener("click", () => {
                    branchesContainer.removeChild(branchDiv);
                });
            });
        }

        generateSummaryBtn.classList.remove("hidden");
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            hideLoading(this, originalContent);
        }
    });

    // Update Generate Seating Plan button click handler
    generateSummaryBtn.addEventListener("click", async function () {
        if (!confirm('Are you sure you want to generate the seating plan? This action cannot be undone.')) {
            return;
        }

        const originalContent = showLoading(this);
        
        try {
        const selectedBlock = blockSelect.value;
            const rooms = [];
            const usedRoomNumbers = new Set();

            // Collect and validate room data
        document.querySelectorAll(".room-section").forEach(roomDiv => {
            const roomNumber = roomDiv.querySelector(".room-number").value;
                const roomCapacity = parseInt(roomDiv.querySelector(".room-capacity").value);
                const branchesContainer = roomDiv.querySelector(".branches-container");
                
                // Check for duplicate room numbers
                if (usedRoomNumbers.has(roomNumber)) {
                    throw new Error(`Duplicate room number: ${roomNumber}`);
                }
                usedRoomNumbers.add(roomNumber);
                
                // Validate minimum branches
                if (branchesContainer.children.length < 2) {
                    throw new Error(`Room ${roomNumber} must have at least 2 branches for proper seating arrangement.`);
                }
                
                const branches = [];
                const usedBranches = new Set();
                let totalStudentsRequested = 0;
                
                branchesContainer.querySelectorAll(".branch-section").forEach(branchDiv => {
                    const branch = branchDiv.querySelector(".branch-name").value;
                    const subject = branchDiv.querySelector(".subject-name").value;
                    const studentsCount = parseInt(branchDiv.querySelector(".students-count").value);
                    
                    // Validate branch uniqueness in room
                    if (usedBranches.has(branch)) {
                        throw new Error(`Duplicate branch ${branch} in room ${roomNumber}`);
                    }
                    usedBranches.add(branch);
                    
                    // Validate student count
                    if (isNaN(studentsCount) || studentsCount < 1) {
                        throw new Error(`Invalid student count for ${branch} in room ${roomNumber}`);
                    }
                    
                    totalStudentsRequested += studentsCount;
                    branches.push({ branch, subject, studentsCount });
                });
                
                // Validate room capacity
                if (totalStudentsRequested > roomCapacity) {
                    throw new Error(`Room ${roomNumber} capacity (${roomCapacity}) is less than requested students (${totalStudentsRequested})`);
                }
                
                rooms.push({
                    roomNumber,
                    capacity: roomCapacity,
                    branches
            });
        });

            // Send data to server
            const response = await fetch('http://localhost:5000/api/generate-seating-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    block: selectedBlock,
                    rooms
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Validate received data
                const hasInvalidData = data.data.some(student => !student.roll_no);
                if (hasInvalidData) {
                    throw new Error("Received invalid student data from server");
                }
                
                // Display the generated seating plan
        seatingTable.innerHTML = "";
                data.data.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                        <td>${student.roll_no}</td>
                        <td>${student.block}</td>
                        <td>${student.room}</td>
                        <td>${student.seat_no}</td>
                        <td>${student.branch}</td>
                        <td>${student.subject}</td>
            `;
            seatingTable.appendChild(row);
        });

                finalSeatingData = data.data;
                showNotification('Seating plan generated successfully!', 'success');
        loadSeatingBtn.classList.remove("hidden");
        exportCSVBtn.classList.remove("hidden");
            } else {
                throw new Error(data.message || "Error generating seating plan");
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            hideLoading(this, originalContent);
        }
    });

    // 🎯 Load Seating Plan
    loadSeatingBtn.addEventListener("click", async function () {
        try {
            // Always fetch from database to get latest data
                const response = await fetch('http://localhost:5000/api/seating-data');
                const data = await response.json();
                
                if (!data.success) {
                    alert("Error fetching seating data");
                    return;
                }

            // Clear existing table
            seatingTable.innerHTML = "";
            finalSeatingData = data.data; // Store the data for export

            // Populate table with seating data
            data.data.forEach(student => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${student.roll_no}</td>
                    <td>${student.block}</td>
                    <td>${student.room}</td>
                    <td>${student.seat_no}</td>
                    <td>${student.branch}</td>
                    <td>${student.subject}</td>
                `;
                seatingTable.appendChild(row);
            });

            alert("Seating plan loaded successfully with actual roll numbers!");
        } catch (error) {
            console.error("Error loading seating plan:", error);
            alert("Error loading seating plan. Please try again.");
        }
    });

    // 🎯 Export to CSV
    exportCSVBtn.addEventListener("click", function () {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Roll No,Block,Room,Seat No,Branch,Subject\n";

        finalSeatingData.forEach(data => {
            csvContent += `${data.roll_no},${data.block},${data.room},${data.seat_no},${data.branch},${data.subject}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "seating_plan.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Event listener for branch selection
    branchSelect.addEventListener("change", function() {
        loadStudentsByBranch(this.value);
    });

    // Pagination state
    let currentPage = 1;
    let pageSize = 10;
    let filteredData = [];

    // Initialize new controls
    function initializeControls() {
        const searchInput = document.getElementById('searchInput');
        const filterBranch = document.getElementById('filterBranch');
        const sortBy = document.getElementById('sortBy');
        const sortOrder = document.getElementById('sortOrder');
        
        // Add event listeners
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        filterBranch.addEventListener('change', handleFilters);
        sortBy.addEventListener('change', handleSort);
        sortOrder.addEventListener('click', toggleSortOrder);
        
        // Initialize pagination controls
        document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
        document.getElementById('nextPage').addEventListener('click', () => changePage(1));
        document.getElementById('pageSize').addEventListener('change', handlePageSizeChange);
    }

    // Debounce function for search
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Handle search
    function handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const searchIcon = document.querySelector('.search-icon');
        
        // Add loading animation
        searchIcon.className = 'fas fa-spinner fa-spin search-icon';
        
        setTimeout(() => {
            filteredData = finalSeatingData.filter(item => 
                item.roll_no.toLowerCase().includes(searchTerm) ||
                item.branch.toLowerCase().includes(searchTerm) ||
                item.subject.toLowerCase().includes(searchTerm) ||
                item.room.toLowerCase().includes(searchTerm)
            );
            
            currentPage = 1;
            renderTable();
            
            // Reset search icon
            searchIcon.className = 'fas fa-search search-icon';
        }, 300);
    }

    // Handle filters
    function handleFilters() {
        const branch = document.getElementById('filterBranch').value;
        const subject = document.getElementById('filterSubject').value;
        const room = document.getElementById('filterRoom').value;
        
        filteredData = finalSeatingData.filter(item => 
            (!branch || item.branch === branch) &&
            (!subject || item.subject === subject) &&
            (!room || item.room === room)
        );
        
        currentPage = 1;
        renderTable();
    }

    // Handle sorting
    function handleSort() {
        const sortBy = document.getElementById('sortBy').value;
        const sortOrderBtn = document.getElementById('sortOrder');
        const isAscending = sortOrderBtn.getAttribute('data-order') === 'asc';
        
        // Update sort order button appearance
        sortOrderBtn.innerHTML = isAscending 
            ? '<i class="fas fa-sort-amount-up"></i>' 
            : '<i class="fas fa-sort-amount-down"></i>';
        
        filteredData.sort((a, b) => {
            let compareResult;
            // Handle numeric values
            if (sortBy === 'seat_no' || sortBy === 'room') {
                compareResult = parseInt(a[sortBy]) - parseInt(b[sortBy]);
            } else {
                compareResult = a[sortBy].localeCompare(b[sortBy]);
            }
            return isAscending ? compareResult : -compareResult;
        });
        
        renderTable();
    }

    // Toggle sort order
    function toggleSortOrder(e) {
        const button = e.currentTarget;
        const currentOrder = button.getAttribute('data-order') === 'asc' ? 'desc' : 'asc';
        button.setAttribute('data-order', currentOrder);
        button.innerHTML = currentOrder === 'asc' 
            ? '<i class="fas fa-sort-amount-up"></i>' 
            : '<i class="fas fa-sort-amount-down"></i>';
        handleSort();
    }

    // Render table with pagination
    function renderTable() {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = filteredData.slice(startIndex, endIndex);
        
        const tbody = document.querySelector('#seatingTable tbody');
        tbody.innerHTML = '';
        
        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">
                        <i class="fas fa-search"></i>
                        No matching records found
                    </td>
                </tr>
            `;
            return;
        }

        pageData.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.roll_no}</td>
                <td>${student.block}</td>
                <td>${student.room}</td>
                <td>${student.seat_no}</td>
                <td>${student.branch}</td>
                <td>${student.subject}</td>
            `;
            tbody.appendChild(row);
        });
        
        updatePaginationControls();
    }

    // Update pagination controls
    function updatePaginationControls() {
        const totalPages = Math.ceil(filteredData.length / pageSize);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        // Add loading animation
        [prevBtn, nextBtn].forEach(btn => {
            btn.addEventListener('click', function() {
                if (!this.disabled) {
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    setTimeout(() => {
                        this.innerHTML = this.id === 'prevPage' ? 'Previous' : 'Next';
                    }, 300);
                }
            });
        });
    }

    // Change page
    function changePage(delta) {
        currentPage += delta;
        renderTable();
    }

    // Handle page size change
    function handlePageSizeChange(e) {
        pageSize = parseInt(e.target.value);
        currentPage = 1;
        renderTable();
    }

    // Add this to your existing DOMContentLoaded event listener
    initializeControls();
    // Initialize filteredData with all data
    filteredData = [...finalSeatingData];
    renderTable();

    // Update navigation link active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Help button functionality
    document.getElementById('help-btn').addEventListener('click', () => {
        showHelpModal();
    });

    // Logout button functionality
    document.getElementById('logout-btn').addEventListener('click', showLogoutConfirmation);

    // Enhanced logout functionality
    function showLogoutConfirmation() {
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-sign-out-alt"></i> Confirm Logout</h3>
            </div>
            <p>Are you sure you want to logout?</p>
            <div class="buttons">
                <button class="cancel rectangle">Cancel</button>
                <button class="confirm rectangle">Logout</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            modal.classList.add('show');
            overlay.classList.add('show');
        }, 10);
        
        modal.querySelector('.cancel').addEventListener('click', () => {
            closeModal(modal, overlay);
        });
        
        modal.querySelector('.confirm').addEventListener('click', () => {
            performLogout(modal, overlay);
        });
    }

    function closeModal(modal, overlay) {
        modal.classList.remove('show');
        overlay.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            overlay.remove();
        }, 300);
    }

    async function performLogout(modal, overlay) {
        try {
            // Show loading state
            const logoutBtn = modal.querySelector('.confirm');
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            logoutBtn.disabled = true;
            
            // Clear session storage or cookies if any
            sessionStorage.clear();
            localStorage.clear();
            
            // Add fade-out animation
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            
            // Redirect after animation
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 800);
            
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error during logout. Please try again.');
            closeModal(modal, overlay);
        }
    }

    // Function to show help modal
    function showHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'help-modal';
        modal.innerHTML = `
            <div class="help-header">
                <h2><i class="fas fa-question-circle"></i> Help Guide</h2>
                <button class="close-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="help-content">
                <h3>Getting Started</h3>
                <p>1. Select a block and enter the number of rooms</p>
                <p>2. Click "Generate Rooms" to create room configurations</p>
                <p>3. Add branches and subjects for each room</p>
                <p>4. Generate the seating plan</p>
                
                <h3>Additional Features</h3>
                <p>• Export CSV: Download current seating plan</p>
                <p>• View Students: Check student assignments by branch</p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            modal.classList.add('show');
            overlay.classList.add('show');
        }, 10);
        
        // Close button functionality
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.classList.remove('show');
            overlay.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                overlay.remove();
            }, 300);
        });

        // Close on overlay click
        overlay.addEventListener('click', () => {
            modal.querySelector('.close-btn').click();
        });
    }

    // Initialize session start time
    const sessionStartTime = new Date();

    // Update session time every second
    setInterval(updateSessionTime, 1000);

    function updateSessionTime() {
        const now = new Date();
        const diff = now - sessionStartTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const timeElement = document.getElementById('session-time');
        timeElement.innerHTML = `
            <i class="fas fa-clock"></i> 
            Session Time: ${hours}h ${minutes}m ${seconds}s
        `;
    }

    // Enhanced notification function
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
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Update the filter initialization
    function initializeFilters() {
        const filterBranch = document.getElementById('filterBranch');
        const filterSubject = document.getElementById('filterSubject');
        const filterRoom = document.getElementById('filterRoom');
        
        // Populate subjects based on selected branch
        filterBranch.addEventListener('change', function() {
            const selectedBranch = this.value;
            filterSubject.innerHTML = '<option value="">All Subjects</option>';
            
            if (selectedBranch && subjects[selectedBranch]) {
                subjects[selectedBranch].forEach(subject => {
                    filterSubject.innerHTML += `<option value="${subject}">${subject}</option>`;
                });
            }
        });
        
        // Populate rooms from available data
        const uniqueRooms = [...new Set(finalSeatingData.map(item => item.room))].sort();
        filterRoom.innerHTML = '<option value="">All Rooms</option>';
        uniqueRooms.forEach(room => {
            filterRoom.innerHTML += `<option value="${room}">${room}</option>`;
        });
        
        // Add event listeners
        [filterBranch, filterSubject, filterRoom].forEach(filter => {
            filter.addEventListener('change', handleFilters);
        });
    }

    // Add this to your DOMContentLoaded event listener
    document.addEventListener('DOMContentLoaded', function() {
        // ... existing code ...
        
        initializeFilters();
        
        // Initialize sort order button
        const sortOrderBtn = document.getElementById('sortOrder');
        sortOrderBtn.setAttribute('data-order', 'asc');
        sortOrderBtn.innerHTML = '<i class="fas fa-sort-amount-up"></i>';
    });

    // Update the preview button click handler
    previewRoomBtn.addEventListener("click", function() {
        const roomSections = document.querySelectorAll(".room-section");
        if (!roomSections.length) {
            showNotification("Please generate rooms first", "error");
            return;
        }
        
        const roomsData = Array.from(roomSections).map(section => {
            const roomNumber = section.querySelector(".room-number").value;
            const branchSections = Array.from(section.querySelectorAll(".branch-section"));
            
            return {
                roomNumber,
                capacity: parseInt(section.querySelector(".room-capacity").value) || 48,
                branches: branchSections.map(branch => ({
                    branch: branch.querySelector(".branch-name").value,
                    count: parseInt(branch.querySelector(".students-count").value) || 0
                }))
            };
        });
        
        showRoomPreview(roomsData);
        roomPreviewModal.style.display = "block";
    });

    // Updated showRoomPreview function
    function showRoomPreview(roomsData) {
        const container = document.getElementById('roomPreviewContainer');
        container.innerHTML = '';

        // Add preview header with download button
        const headerDiv = document.createElement('div');
        headerDiv.className = 'preview-header';
        headerDiv.innerHTML = `
            <h2>Room Layout Preview</h2>
            <div class="preview-actions">
                <button class="download-pdf-btn" onclick="downloadRoomPDF()">
                    <i class="fas fa-file-pdf"></i>
                    Download PDF
                </button>
            </div>
        `;
        container.appendChild(headerDiv);

        // Create a container for all rooms
        const allRoomsContainer = document.createElement('div');
        allRoomsContainer.id = 'allRoomsPreview';
        allRoomsContainer.style.cssText = `
            width: 100%;
            padding: 20px;
            box-sizing: border-box;
            overflow: visible;
        `;
        container.appendChild(allRoomsContainer);

        roomsData.forEach(async (room, index) => {
            const roomSection = document.createElement('div');
            roomSection.className = 'room-section-preview';
            roomSection.style.pageBreakInside = 'avoid';

            roomSection.innerHTML = `
                <div class="preview-header">
                    <h3>Room ${room.roomNumber}</h3>
                    <div class="branch-legend">
                        ${room.branches.map(b => 
                            `<span class="branch-tag" data-branch="${b.branch}">
                                ${b.branch}: ${b.count} students
                            </span>`
                        ).join('')}
                    </div>
                </div>

                <div class="teacher-area">
                    <div class="teacher-desk">
                        <i class="fas fa-chalkboard-teacher"></i>
                        <span>Teacher's Desk</span>
                    </div>
                </div>

                <div class="bench-grid">
                    ${await generateBenchLayout(room)}
                </div>
            `;

            allRoomsContainer.appendChild(roomSection);

            if (index < roomsData.length - 1) {
                const divider = document.createElement('div');
                divider.className = 'room-divider';
                divider.style.pageBreakAfter = 'always';
                allRoomsContainer.appendChild(divider);
            }
        });
    }

    // Updated generateBenchLayout function
    async function generateBenchLayout(room) {
        let layout = '';
        const rows = 6;
        const cols = 4; // 4 benches per row, each bench has 2 seats

        try {
            const response = await fetch('http://localhost:5000/api/seating-data');
                const data = await response.json();
            const roomSeats = data.success ? data.data.filter(s => s.room === room.roomNumber) : [];

            for (let row = 0; row < rows; row++) {
                layout += `<div class="bench-row">`;
                
                for (let col = 0; col < cols; col++) {
                    const leftSeatNum = row * 8 + (col * 2) + 1;
                    const rightSeatNum = leftSeatNum + 1;
                    
                    const leftSeat = roomSeats.find(s => parseInt(s.seat_no) === leftSeatNum);
                    const rightSeat = roomSeats.find(s => parseInt(s.seat_no) === rightSeatNum);
                    
                    layout += `
                        <div class="bench">
                            <div class="bench-top"></div>
                            <div class="bench-seats">
                                <div class="seat ${leftSeat ? 'occupied' : 'empty'}" 
                                     data-branch="${leftSeat?.branch || ''}"
                                     title="${getStudentTooltip(leftSeat)}">
                                    <div class="roll-number">${leftSeat?.roll_no || '-'}</div>
                                    <div class="seat-number">
                                        <i class="fas fa-chair"></i> ${leftSeatNum}
                                    </div>
                                </div>
                                <div class="seat ${rightSeat ? 'occupied' : 'empty'}"
                                     data-branch="${rightSeat?.branch || ''}"
                                     title="${getStudentTooltip(rightSeat)}">
                                    <div class="roll-number">${rightSeat?.roll_no || '-'}</div>
                                    <div class="seat-number">
                                        <i class="fas fa-chair"></i> ${rightSeatNum}
                                    </div>
                                </div>
                            </div>
                            <div class="bench-bottom"></div>
                        </div>
                    `;
                }
                
                layout += `</div>`;
            }
        } catch (error) {
            console.error('Error fetching seating data:', error);
            layout = '<div class="error">Error loading seating data</div>';
        }
        
        return layout;
    }

    // Updated getStudentTooltip function
    function getStudentTooltip(student) {
        if (!student) return 'Empty Seat';
        return `Roll No: ${student.roll_no}
Branch: ${student.branch}
Subject: ${student.subject}`;
    }

    // Update modal close handlers
    closePreviewBtn.addEventListener("click", function() {
        roomPreviewModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === roomPreviewModal) {
            roomPreviewModal.style.display = "none";
        }
    });

    // Update the downloadRoomPDF function
    async function downloadRoomPDF() {
        const element = document.getElementById('allRoomsPreview');
        const downloadBtn = document.querySelector('.download-pdf-btn');
        
        if (!element) {
            showNotification('No preview content found', 'error');
            return;
        }

        try {
            downloadBtn.classList.add('loading');
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';

            // Create a clone for PDF generation
            const clone = element.cloneNode(true);
            const tempContainer = document.createElement('div');
            tempContainer.id = 'pdf-container';
            tempContainer.style.cssText = `
                background-color: white !important;
                width: 297mm !important;
                padding: 20mm !important;
                margin: 0 !important;
                visibility: visible !important;
            `;

            // Process elements to ensure proper layout
            const processElement = (el) => {
                if (!el) return;
                
                // Ensure visibility
                el.style.visibility = 'visible';
                el.style.overflow = 'visible';
                
                // Handle specific elements
                if (el.classList.contains('bench-row')) {
                    el.style.pageBreakInside = 'avoid';
                    el.style.display = 'flex';
                    el.style.justifyContent = 'space-between';
                    el.style.width = '100%';
                }
                
                if (el.classList.contains('bench')) {
                    el.style.flex = '1';
                    el.style.maxWidth = 'calc(25% - 15px)';
                    el.style.pageBreakInside = 'avoid';
                }
                
                if (el.classList.contains('seat')) {
                    el.style.backgroundColor = 'white';
                    el.style.pageBreakInside = 'avoid';
                }
                
                Array.from(el.children).forEach(processElement);
            };

            processElement(clone);
            tempContainer.appendChild(clone);
            document.body.appendChild(tempContainer);

            const opt = {
                margin: [20, 20, 20, 20],
                filename: 'seating_arrangement.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    letterRendering: true,
                    allowTaint: true,
                    foreignObjectRendering: true,
                    scrollY: 0,
                    width: tempContainer.scrollWidth,
                    height: tempContainer.scrollHeight
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a3',
                    orientation: 'landscape',
                    compress: true,
                    precision: 16
                },
                pagebreak: { 
                    mode: ['avoid-all', 'css', 'legacy'],
                    before: '.room-divider',
                    after: '.room-section-preview'
                }
            };

            // Generate PDF
            await html2pdf().from(tempContainer).set(opt)
                .toPdf()
                .get('pdf')
                .then((pdf) => {
                    pdf.setProperties({
                        title: 'Seating Arrangement',
                        subject: 'Exam Seating Plan',
                        creator: 'EduSeater'
                    });
                })
                .save();

            // Cleanup
            document.body.removeChild(tempContainer);
            
            downloadBtn.classList.remove('loading');
            downloadBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
            showNotification('PDF downloaded successfully!', 'success');

        } catch (error) {
            console.error('PDF generation error:', error);
            showNotification('Error generating PDF. Please try again.', 'error');
            downloadBtn.classList.remove('loading');
            downloadBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
        }
    }

    // Make sure to expose the function globally
    window.downloadRoomPDF = downloadRoomPDF;
});
