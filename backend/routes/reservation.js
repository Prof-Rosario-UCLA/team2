import express from "express";
import {
  getAllReservations,
  getReservationsByDateRange,
  insertReservation,
} from "../utils/mongodb.js";
import { Reservation } from "../models/Reservation.js";
import { cacheResult, fetchFromCache } from '../utils/redis.js';


const router = express.Router();

// Get all reservations
router.get("/", async (req, res) => {
  try {
    console.log("Attempting to fetch data from cache");
    const cachedData = await fetchFromCache('reservation');
    if (cachedData){
      console.log("Data found in cache");
      return res.status(200).json(cachedData);
    }
    else{
      console.log("Data not found in cache");
    }
    console.log("Querying MongoDB");
    const reservations = await getAllReservations();
    await cacheResult('reservation', reservations, 300);
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

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const reservations = await getReservationsByDateRange(start, end);
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

    // Validate dates
    const startTime = new Date(reservationData.date);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    if (isNaN(startTime.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

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
    await cacheResult('reservation', updatedAllReservations, 300);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error in POST /reservations:", error);
    res.status(500).json({ error: "Failed to create reservation" });
  }
});

export default router;
