import express from "express";
import {
  getAllWalkIns,
  getWalkInsByDateRange,
  insertWalkIn,
} from "../utils/mongodb.js";
import { WalkIn } from "../models/WalkIn.js";

const router = express.Router();

// Get all walk-ins
router.get("/", async (req, res) => {
  try {
    console.log("Trying to GET all walk-ins");
    const walkIns = await getAllWalkIns();
    res.json(walkIns);
  } catch (error) {
    console.error("Error in GET /walkins:", error);
    res.status(500).json({ error: "Failed to fetch walk-ins" });
  }
});

// Get walk-ins by date range
router.get("/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const walkIns = await getWalkInsByDateRange(start, end);
    res.json(walkIns);
  } catch (error) {
    console.error("Error in GET /walkins/range:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch walk-ins by date range" });
  }
});

// Create a new walk-in
router.post("/create", async (req, res) => {
  try {
    const walkInData = req.body;

    // Validate required fields
    if (!walkInData.size || !walkInData.name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newWalkIn = {
      name: walkInData.name,
      phoneNumber: walkInData.phoneNumber,
      size: walkInData.size,
      timeAddedToWaitlist: new Date(),
      comments: walkInData.comments || "",
    };

    const result = await insertWalkIn(newWalkIn);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error in POST /walkins:", error);
    res.status(500).json({ error: "Failed to create walk-in" });
  }
});

export default router;
