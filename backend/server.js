require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1); // Exit process on error
    });

mongoose.set("strictQuery", false);

// User Schema (For both students & admins)
const UserSchema = new mongoose.Schema(
    {
        role: { type: String, required: true, enum: ["student", "admin"] },
        username: { type: String },
        roll_no: { type: String },
        date_of_birth: { type: String },
        password: { type: String, required: true },
        branch: { type: String }
    },
    { collection: "user" }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model("User", UserSchema);

// Student Schema for storing seating data
const StudentSchema = new mongoose.Schema({
    roll_no: { 
        type: String, 
        required: true,
        unique: true,
        sparse: true // Allows skipping duplicate null values
    },
    block: { type: String, required: true },
    room: { type: String, required: true },
    seat_no: { type: Number, required: true },
    branch: { type: String, required: true },
    subject: { type: String, required: true }
}, { collection: "students" });

// Add compound index for better querying
StudentSchema.index({ block: 1, room: 1, seat_no: 1 });

const Student = mongoose.model("Student", StudentSchema);

// Add indexes for better performance
UserSchema.index({ role: 1, branch: 1, roll_no: 1 });

// Add input sanitization helper
const sanitizeInput = (input) => {
    return String(input).replace(/[^a-zA-Z0-9\s\-]/g, '');
};

// Update the branch mapping to match your database
const branchMapping = {
    'AID': 'AIDS',
    'CSE': 'CSE',
    'AIML': 'AIML',
    'IT': 'INF',
    'CIC': 'CIC',
    'CSO': 'CSO',
    'CSM': 'CSM',
    'ECE': 'ECE',
    'EEE': 'EEE',
    'MECH': 'MECH',
    'CIVIL': 'CIVIL'
};

// Admin Registration Route to insert hashed password
app.post("/api/admin/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if username is already taken
        const existingAdmin = await User.findOne({ role: "admin", username });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "Admin username already exists!" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin user
        const newAdmin = new User({
            role: "admin",
            username,
            password: hashedPassword
        });

        await newAdmin.save();
        res.status(201).json({ success: true, message: "Admin registered successfully!" });
    } catch (error) {
        console.error("❌ Error registering admin:", error);
        res.status(500).json({ success: false, message: "Error registering admin." });
    }
});

// Admin Authentication Route
app.post("/api/auth/admin", async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("🔍 Admin Login Attempt:", { username });

        // Fetch admin from DB
        const admin = await User.findOne({ role: "admin", username });

        // Check if admin exists
        if (!admin) {
            console.log("❌ Admin not found");
            return res.status(401).json({ success: false, message: "Invalid Admin Username or Password!" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (isMatch) {
            console.log("✅ Admin login successful");
            return res.json({ success: true, redirect: "admin/admin.html" });
        } else {
            console.log("❌ Incorrect password");
            return res.status(401).json({ success: false, message: "Invalid Admin Username or Password!" });
        }
    } catch (error) {
        console.error("❌ Database Query Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});

// Date parsing function to handle 'DD-MM-YYYY' format
function parseDate(dateString) {
    const parts = dateString.split("-");
    if (parts.length === 3) {
        const [day, month, year] = parts;
        // Return date in "YYYY-MM-DD" format
        return `${year}-${month}-${day}`;
    }
    return null;
}

// Student Authentication Route
app.post("/api/auth/student", async (req, res) => {
    const { roll_no, date_of_birth } = req.body;

    // Validate required fields
    if (!roll_no || !date_of_birth) {
        console.error("❌ Missing fields: roll_no or date_of_birth");
        return res.status(400).json({ success: false, message: "Roll Number and Date of Birth are required!" });
    }

    const lowerRollNo = roll_no;
    const parsedDate = parseDate(date_of_birth);

    if (!parsedDate) {
        console.error("❌ Invalid date format:", date_of_birth);
        return res.status(400).json({ success: false, message: "Invalid Date Format! Ensure it's in DD-MM-YYYY format." });
    }

    try {
        console.log("🔍 Student Login Attempt:", { roll_no: lowerRollNo, date_of_birth: parsedDate });

        const student = await User.findOne({ role: "student", roll_no: lowerRollNo, date_of_birth: parsedDate });

        if (student) {
            console.log("✅ Student login successful");
            return res.json({ success: true, redirect: "seat/seat.html" });
        } else {
            console.log("❌ Student not found");
            return res.status(401).json({ success: false, message: "Invalid Roll Number or Date of Birth!" });
        }
    } catch (error) {
        console.error("❌ Database Query Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});

// CSV Upload Route
app.post("/api/upload-csv", upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    try {
        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                // Transform the data to match our schema
                const transformedData = {
                    roll_no: data['Roll No'],
                    block: data['Block'],
                    room: data['Room'],
                    seat_no: parseInt(data['Seat No']),
                    branch: data['Branch'],
                    subject: data['Subject']
                };
                results.push(transformedData);
            })
            .on('end', async () => {
                try {
                    // Delete the temporary file
                    fs.unlinkSync(req.file.path);

                    // Clear existing data
                    await Student.deleteMany({});

                    // Insert new data
                    const insertedData = await Student.insertMany(results);
                    
                    console.log(`✅ Successfully imported ${insertedData.length} records`);
                    res.json({ 
                        success: true, 
                        message: `Successfully imported ${insertedData.length} records`,
                        count: insertedData.length
                    });
                } catch (dbError) {
                    console.error("Database Error:", dbError);
                    res.status(500).json({ 
                        success: false, 
                        message: "Error saving data to database",
                        error: dbError.message 
                    });
                }
            })
            .on('error', (error) => {
                console.error("CSV Processing Error:", error);
                res.status(500).json({ 
                    success: false, 
                    message: "Error processing CSV file",
                    error: error.message 
                });
            });
    } catch (error) {
        console.error("File Processing Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error processing file",
            error: error.message 
        });
    }
});

// Update the Get Seating Data Route
app.get("/api/seating-data", async (req, res) => {
    try {
        // Get seating data directly from students collection and sort it
        const seatingData = await Student.find({})
            .sort({ block: 1, room: 1, seat_no: 1 })
            .lean(); // Convert to plain JavaScript objects
        
        // Return the seating data directly without mapping
        res.json({ 
            success: true, 
            data: seatingData,
            message: "Seating data fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching seating data:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching seating data",
            error: error.message 
        });
    }
});

// Update the Get Students by Branch Route
app.get("/api/students/:branch", async (req, res) => {
    try {
        const { branch } = req.params;
        const dbBranch = branchMapping[branch] || branch;
        
        // Get students from user collection
        const userStudents = await User.find({ 
            role: "student",
            branch: dbBranch 
        }).sort({ roll_no: 1 }).lean();

        // Get seating assignments
        const seatingAssignments = await Student.find({ 
            branch: dbBranch 
        }).lean();

        // Map the data with proper roll number handling
        const students = userStudents.map(user => {
            const seating = seatingAssignments.find(s => s.roll_no === user.roll_no);
            return {
                roll_no: user.roll_no,
                branch: dbBranch,
                room: seating ? seating.room : "Not Assigned",
                seat_no: seating ? seating.seat_no : "Not Assigned",
                subject: seating ? seating.subject : "Not Assigned",
                block: seating ? seating.block : "Not Assigned"
            };
        });

        res.json({ 
            success: true, 
            data: students,
            message: `Found ${students.length} students in ${branch}`
        });
    } catch (error) {
        console.error("Error fetching students by branch:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching students data",
            error: error.message 
        });
    }
});

// Add this helper function at the top of your file
async function fetchAvailableStudents() {
    try {
        // Fetch all students from user collection
        const students = await User.find({
            role: "student",
            branch: { $exists: true },
            roll_no: { $exists: true }
        }).select('roll_no branch').lean();

        // Group students by branch
        const branchWiseStudents = {};
        students.forEach(student => {
            // Convert branch names to UI format using branchMapping
            const uiBranch = Object.entries(branchMapping)
                .find(([_, dbBranch]) => dbBranch === student.branch)?.[0] || student.branch;
            
            if (!branchWiseStudents[uiBranch]) {
                branchWiseStudents[uiBranch] = [];
            }
            branchWiseStudents[uiBranch].push(student);
        });

        // Log available students per branch
        console.log('📊 Available students per branch:');
        Object.entries(branchWiseStudents).forEach(([branch, students]) => {
            console.log(`${branch}: ${students.length} students`);
        });

        return branchWiseStudents;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw new Error('Failed to fetch student data from database');
    }
}

// Update the generate-seating-plan endpoint
app.post('/api/generate-seating-plan', async (req, res) => {
    try {
        const { block, rooms } = req.body;
        console.log(`🎯 Generating seating plan for block: ${block}`);
        
        const sanitizedBlock = sanitizeInput(block);
        const usedRollNumbers = new Set();
        let totalAssigned = 0;

        // Fetch available students first
        const branchWiseStudents = await fetchAvailableStudents();

        // Validate student availability for all rooms
        for (const room of rooms) {
            for (const { branch, studentsCount } of room.branches) {
                const availableStudents = branchWiseStudents[branch] || [];
                const availableCount = availableStudents.filter(s => !usedRollNumbers.has(s.roll_no)).length;

                if (availableCount < studentsCount) {
                    throw new Error(
                        `Not enough students in ${branch} branch. ` +
                        `Required: ${studentsCount}, Available: ${availableCount}. ` +
                        `Total students in ${branch}: ${availableStudents.length}. ` +
                        `Please adjust the seating plan.`
                    );
                }
            }
        }

        // Generate seating plan for each room
        const seatingPlan = [];
        
        for (const room of rooms) {
            const { roomNumber, branches: roomBranches } = room;
            console.log(`🏗️ Processing room ${roomNumber}`);
            
            const seatingGrid = Array(6).fill(null).map(() => Array(8).fill(null));
            const capacity = 48;

            // Validate room capacity
            const totalRequestedStudents = roomBranches.reduce((sum, { studentsCount }) => sum + studentsCount, 0);
            if (totalRequestedStudents > capacity) {
                throw new Error(`Room ${roomNumber} capacity exceeded (${totalRequestedStudents}/${capacity})`);
            }

            // Create student pools by branch
            const branchPools = {};
            for (const { branch, subject, studentsCount } of roomBranches) {
                const availableStudents = (branchWiseStudents[branch] || [])
                    .filter(s => !usedRollNumbers.has(s.roll_no))
                    .slice(0, studentsCount);

                if (availableStudents.length < studentsCount) {
                    throw new Error(
                        `Insufficient students in ${branch} branch for room ${roomNumber}. ` +
                        `Required: ${studentsCount}, Available: ${availableStudents.length}`
                    );
                }

                branchPools[branch] = {
                    students: availableStudents,
                    subject,
                    remaining: studentsCount,
                    currentIndex: 0
                };
            }

            // Assign seats using CSP algorithm
            let seatNumber = 1;
            for (let row = 0; row < 6; row++) {
                for (let col = 0; col < 8; col++) {
                    if (seatNumber > capacity) break;

                    // Find valid branch for this position
                    let assigned = false;
                    for (const [branch, pool] of Object.entries(branchPools)) {
                        if (pool.remaining > 0 && isValidPlacement(seatingGrid, row, col, branch)) {
                            const student = pool.students[pool.currentIndex];
                            
                            seatingGrid[row][col] = {
                                student,
                                branch,
                                seatNumber
                            };

                            seatingPlan.push({
                                roll_no: student.roll_no,
                                block: sanitizedBlock,
                                room: roomNumber,
                                seat_no: seatNumber,
                                branch: student.branch,
                                subject: pool.subject
                            });

                            usedRollNumbers.add(student.roll_no);
                            pool.currentIndex++;
                            pool.remaining--;
                            totalAssigned++;
                            assigned = true;
                            break;
                        }
                    }

                    if (assigned) {
                        seatNumber++;
                    }
                }
            }
        }

        // Save to database
        await Student.deleteMany({});
        await Student.insertMany(seatingPlan);

        console.log(`✅ Successfully assigned ${totalAssigned} students`);
        
        // Return detailed response
        res.json({ 
            success: true, 
            data: seatingPlan,
            message: `Successfully assigned ${totalAssigned} students`,
            stats: {
                totalAssigned,
                branchDistribution: Object.fromEntries(
                    Object.entries(branchWiseStudents).map(([branch, students]) => [
                        branch,
                        {
                            total: students.length,
                            assigned: seatingPlan.filter(s => s.branch === branch).length,
                            available: students.length - seatingPlan.filter(s => s.branch === branch).length
                        }
                    ])
                )
            }
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message,
            details: {
                type: error.name,
                message: error.message,
                availableBranches: await fetchAvailableStudents()
                    .then(students => Object.fromEntries(
                        Object.entries(students).map(([branch, list]) => [branch, list.length])
                    ))
                    .catch(() => ({}))
            }
        });
    }
});

// Add this helper function to check valid placement
function isValidPlacement(grid, row, col, branch) {
    const rows = 6, cols = 8;
    
    // Check adjacent positions (left, right, front, back)
    const directions = [
        [0, -1], // left
        [0, 1],  // right
        [-1, 0], // front
        [1, 0]   // back
    ];

    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            if (grid[newRow][newCol]?.branch === branch) {
                return false;
            }
        }
    }
    return true;
}

// Update the student seat endpoint
app.get("/api/student-seat/:rollNo", async (req, res) => {
    try {
        const { rollNo } = req.params;
        console.log('🔍 Searching for roll number:', rollNo);
        
        // Find student's seating details in the students collection (case-insensitive)
        const seatDetails = await Student.findOne({ 
            roll_no: { 
                $regex: new RegExp(`^${rollNo.trim()}$`, 'i') 
            }
        }).select('-__v').lean();

        console.log('Found seat details:', seatDetails);

        if (!seatDetails) {
            console.log('❌ No seat found for roll number:', rollNo);
            return res.status(404).json({ 
                success: false, 
                message: "No seating arrangement found for this roll number" 
            });
        }

        // Format the response data
        const formattedData = {
            ...seatDetails,
            seat_no: String(seatDetails.seat_no).padStart(2, '0')
        };

        console.log('✅ Returning seat details:', formattedData);

        res.json({
            success: true,
            data: formattedData,
            message: "Seating details found successfully"
        });
    } catch (error) {
        console.error("❌ Error fetching student seat:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching seat details",
            error: error.message 
        });
    }
});

// Add this test endpoint
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server Running on Port ${PORT}`));

