import express from "express";
import {
  getAllWalkIns,
  getWalkInsByDateRange,
  insertWalkIn,
} from "../utils/mongodb.js";
import { WalkIn } from "../models/WalkIn.js";
import { cacheResult, fetchFromCache } from '../utils/redis.js';

const router = express.Router();

// Get all walk-ins
router.get("/", async (req, res) => {
  try {
    console.log("Attempting to fetch walk-in data from cache");
    const cachedData = await fetchFromCache('walkin');
    if (cachedData){
      console.log("Data found in cache");
      return res.status(200).json(cachedData);
    }
    else{
      console.log("Data not found in cache");
    }
    console.log("Querying MongoDB");
    const walkIns = await getAllWalkIns();
    await cacheResult('walkin', walkIns, 300);
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
    res.status(500).json({ error: "Failed to fetch walk-ins by date range" });
  }
});

// Create a new walk-in
router.post("/create", async (req, res) => {
  try {
    const walkInData = req.body;

    const [hours, minutes] = walkInData.time.split(":").map(Number);
    const now = new Date();
    const dateWithTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    const newWalkIn = {
      name: `${walkInData.firstname} ${walkInData.lastname}`,
      phoneNumber: walkInData.phone,
      tableNumber: null,
      size: walkInData.partySize,
      timeAddedToWaitlist: dateWithTime,
      startTime: null,
      endTime: null,
      comments: walkInData.specialRequests || "",
    };

    const result = await insertWalkIn(newWalkIn);

    const updatedAllWalkIns = await getAllReservations();
    await cacheResult('walkin', updatedAllWalkIns, 300);
    
    res.status(201).json(result);
  } catch (error) {
    console.error("Error in POST /walkins:", error);
    res.status(500).json({ error: "Failed to create walk-in" });
  }
});

export default router;
