require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust the path to your actual User model

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

async function hashAdminPasswords() {
  try {
    const admins = await User.find({ role: "admin" });

    for (const admin of admins) {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      admin.password = hashedPassword;
      await admin.save();
      console.log(`Password for ${admin.username} has been hashed.`);
    }

    console.log("✅ All admin passwords have been hashed.");
  } catch (err) {
    console.error("❌ Error hashing admin passwords:", err);
  }
}

hashAdminPasswords();
