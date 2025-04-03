const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  isOccupied: { type: Boolean, default: false },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
});

module.exports = mongoose.model("Seat", SeatSchema);
