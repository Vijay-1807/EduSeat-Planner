const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["student", "admin"] },
  roll_no: { type: String },
  date_of_birth: { type: String }
}, { collection: "user" }); // This ensures it uses the 'user' collection in your database

const User = mongoose.model("User", userSchema);

module.exports = User; // Export the User model
