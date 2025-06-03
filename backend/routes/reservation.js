import express from "express";
import {
  getAllReservations,
  getReservationsByDateRange,
  insertReservation,
} from "../utils/mongodb.js";
import { Reservation } from "../models/Reservation.js";
import { cacheResult, fetchFromCache } from "../utils/redis.js";

const router = express.Router();

// Get all reservations
router.get("/", async (req, res) => {
  try {
    console.log("Attempting to fetch data from cache");
    const cachedData = await fetchFromCache("reservation");
    if (cachedData) {
      console.log("Data found in cache");
      return res.status(200).json(cachedData);
    } else {
      console.log("Data not found in cache");
    }
    console.log("Querying MongoDB");
    const reservations = await getAllReservations();
    await cacheResult("reservation", reservations, 300);
    res.json(reservations);
  } catch (error) {
    console.error("Error in GET /reservations:", error);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

// Get reservations by date range
router.get("/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    // const start = new Date(startDate);
    // const end = new Date(endDate);

    // if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    //   return res.status(400).json({ error: "Invalid date format" });
    // }

    const reservations = await getReservationsByDateRange(startDate, endDate);
    res.json(reservations);
  } catch (error) {
    console.error("Error in GET /reservations/range:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch reservations by date range" });
  }
});

// Create a new reservation
router.post("/create", async (req, res) => {
  try {
    const reservationData = req.body;

    console.log("DATA!!!!!", reservationData);

    const datePart = new Date(reservationData.date);
    let startTime = null;
    let endTime = null;

    // Normalize the date to YYYY-MM-DD format regardless of input format
    let dateStr;
    if (reservationData.date.includes("T")) {
      // It's a full UTC timestamp (today's date), convert to local date
      const utcDate = new Date(reservationData.date);

      // Get the local date components
      const year = utcDate.getFullYear();
      const month = String(utcDate.getMonth() + 1).padStart(2, "0");
      const day = String(utcDate.getDate()).padStart(2, "0");

      dateStr = `${year}-${month}-${day}`;
    } else {
      // It's already in YYYY-MM-DD format (future date)
      dateStr = reservationData.date;
    }

    const timeStr = reservationData.time; // e.g., "22:30"

    startTime = `${dateStr}T${timeStr}:00.000Z`;
    const startDate = new Date(startTime);

    // Add 2 hours safely
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    // If you need the result in the same string format:
    endTime = endDate.toISOString();

    console.log("Normalized date:", dateStr);
    console.log("Start:", startTime);
    console.log("End:", endTime);

    const newReservation = {
      name: `${reservationData.firstname} ${reservationData.lastname}`,
      email: reservationData.email || "",
      phone: reservationData.phone || "",
      tableNum: null,
      size: reservationData.partySize,
      startTime: startTime,
      endTime: endTime,
      comments: reservationData.specialRequests || "",
    };

    const result = await insertReservation(newReservation);

    const updatedAllReservations = await getAllReservations();
    await cacheResult("reservation", updatedAllReservations, 300);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error in POST /reservations:", error);
    res.status(500).json({ error: "Failed to create reservation" });
  }
});

router.patch("/updateReservation", async (req, res) => {
  try {
    const { reservationId, tableNum } = req.body;

    // Validate required fields
    if (!reservationId || tableNum === undefined) {
      return res.status(400).json({
        error: "Missing required fields: reservationId and tableNum",
      });
    }

    // Validate tableNum is a valid number (JavaScript number type)
    if (typeof tableNum !== "number" || tableNum < 0) {
      return res.status(400).json({
        error: "tableNum must be a valid non-negative number",
      });
    }

    // Update the reservation - Mongoose will handle the conversion to Number type
    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { tableNum: tableNum },
      { new: true, runValidators: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({
        error: "Reservation not found",
      });
    }

    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({
      error: "Failed to update reservation",
      details: error.message,
    });
  }
});

export default router;
