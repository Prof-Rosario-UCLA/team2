import express from "express";
import {
  getAllWalkIns,
  getWalkInsByDateRange,
  insertWalkIn,
} from "../utils/mongodb.js";
import { WalkIn } from "../models/WalkIn.js";
import { cacheResult, fetchFromCache } from "../utils/redis.js";

const router = express.Router();

// Get all walk-ins
router.get("/", async (req, res) => {
  try {
    console.log("Attempting to fetch walk-in data from cache");
    const cachedData = await fetchFromCache("walkin");
    if (cachedData) {
      console.log("Data found in cache");
      return res.status(200).json(cachedData);
    } else {
      console.log("Data not found in cache");
    }
    console.log("Querying MongoDB");
    const walkIns = await getAllWalkIns();
    await cacheResult("walkin", walkIns, 300);
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
    console.log("HEREEE");
    const walkInData = req.body;

    const datePart = new Date(walkInData.date);

    // Extract date components
    const year = datePart.getFullYear();
    const month = datePart.getMonth();
    const day = datePart.getDate();

    // Extract time components
    const [hours, minutes] = walkInData.time.split(":").map(Number);

    const timeAdded = new Date(Date.UTC(year, month, day, hours, minutes));

    console.log(walkInData);

    const newWalkIn = {
      name: `${walkInData.firstname} ${walkInData.lastname}`,
      phoneNumber: walkInData.phone,
      tableNum: null,
      size: walkInData.partySize,
      timeAddedToWaitlist: timeAdded,
      startTime: null,
      endTime: null,
      comments: walkInData.specialRequests || "",
    };

    console.log(newWalkIn);

    const result = await insertWalkIn(newWalkIn);

    console.log(result);

    const updatedAllWalkIns = await getAllWalkIns();
    await cacheResult("walkin", updatedAllWalkIns, 300);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in POST /walkins:", error);
    res.status(500).json({ error: "Failed to create walk-in" });
  }
});

router.patch("/updateWalkin", async (req, res) => {
  try {
    const { walkinId, tableNum, time } = req.body;

    if (!walkinId || tableNum === undefined) {
      return res.status(400).json({
        error: "Missing required fields: walkinId and tableNum",
      });
    }

    if (typeof tableNum !== "number" || tableNum < 0) {
      return res.status(400).json({
        error: "tableNum must be a valid non-negative number",
      });
    }

    let startTime, endTime;
    const updateData = {
      tableNum: tableNum
    };

    if (time) {
      // Extract hours, minutes, and period from the time string
      const match = time.match(/(\d+):(\d+)([ap]m)/i);
      if (!match) {
        throw new Error('Invalid time format');
      }

      let [_, hours, minutes, period] = match;
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      // Convert to 24-hour format
      if (period.toLowerCase() === 'pm' && hours !== 12) {
        hours += 12;
      } else if (period.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
      }
      
      const date = new Date();
      startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes));
      endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours + 2, minutes));
      
      // Only add time fields if time was provided
      updateData.startTime = startTime;
      updateData.endTime = endTime;
    }

    const updatedWalkIn = await WalkIn.findByIdAndUpdate(
      walkinId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedWalkIn) {
      return res.status(404).json({
        error: "Walk-in not found",
      });
    }

    const updatedAllWalkIns = await getAllWalkIns();
    await cacheResult("walkin", updatedAllWalkIns, 300);

    res.status(200).json(updatedWalkIn);
  } catch (error) {
    console.error("Error updating walk-in:", error);
    res.status(500).json({
      error: "Failed to update walk-in",
      details: error.message,
    });
  }
});

// Delete a walk-in by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Walk-in ID is required" });
    }

    const deletedWalkIn = await WalkIn.findByIdAndDelete(id);

    if (!deletedWalkIn) {
      return res.status(404).json({ error: "Walk-in not found" });
    }

    const updatedAllWalkIns = await getAllWalkIns();
    await cacheResult("walkin", updatedAllWalkIns, 300);

    res.status(200).json({
      message: "Walk-in deleted successfully",
      deletedWalkIn
    });
  } catch (error) {
    console.error("Error in DELETE /walkins/delete/:id:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid walk-in ID format" });
    }
    
    res.status(500).json({ 
      error: "Failed to delete walk-in",
      details: error.message 
    });
  }
});

export default router;
