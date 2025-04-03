const express = require("express");
const Seat = require("../models/Seat");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all seats
router.get("/", authMiddleware, async (req, res) => {
  const seats = await Seat.find();
  res.json(seats);
});

// Assign a seat
router.post("/assign", authMiddleware, async (req, res) => {
  const { seatNumber, userId } = req.body;
  const seat = await Seat.findOne({ seatNumber });

  if (!seat) return res.status(404).json({ error: "Seat not found" });

  seat.isOccupied = true;
  seat.assignedUser = userId;
  await seat.save();

  res.json({ message: "Seat assigned", seat });
});

module.exports = router;
