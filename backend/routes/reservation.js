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

    const startTime = new Date(
      `${reservationData.date}T${reservationData.time}:00-07:00`
    ).toISOString();

    const [hours, minutes] = reservationData.time.split(":");
    const endHours = parseInt(hours) + 2;
    const endTimeStr = `${endHours.toString().padStart(2, "0")}:${minutes}`;
    const endTime = new Date(
      `${reservationData.date}T${endTimeStr}:00-07:00`
    ).toISOString();

    console.log("Start (ISO):", startTime);
    console.log("End (ISO):", endTime);

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

    console.log("new reservation: ", newReservation);

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

    // Update the reservation
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

    const updatedAllReservations = await getAllReservations();
    await cacheResult("reservation", updatedAllReservations, 300);

    res.status(200).json(updatedReservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({
      error: "Failed to update reservation",
      details: error.message,
    });
  }
});

// Delete a reservation by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Reservation ID is required" });
    }

    const deletedReservation = await Reservation.findByIdAndDelete(id);

    if (!deletedReservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    const updatedAllReservations = await getAllReservations();
    await cacheResult("reservation", updatedAllReservations, 300);

    res.status(200).json({
      message: "Reservation deleted successfully",
      deletedReservation,
    });
  } catch (error) {
    console.error("Error in DELETE /reservations/:id:", error);

    // Handle specific error cases
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid reservation ID format" });
    }

    res.status(500).json({
      error: "Failed to delete reservation",
      details: error.message,
    });
  }
});

export default router;
