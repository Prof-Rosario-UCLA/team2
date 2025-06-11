import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MainPage from "./MainPage";
import { useCurrDate } from "./CurrDateProvider";
import { API_BASE_URL } from "../frontend-config";
import type { Reservation, Walkin } from "./Sidebar";

function FloorPlan() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitlist, setWaitlist] = useState<Walkin[]>([]);
  const { currDate } = useCurrDate();

  const currDateAsDate = new Date(currDate);

  const convertToPacificTime = (date: Date) => {
    return new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  };

  const fetchTodayReservations = async (
    type: string,
    startDate: string
  ) => {
    try {
      const baseUrl =
        type === "reservation"
          ? `${API_BASE_URL}/reservations/range`
          : `${API_BASE_URL}/walkins/range`;

      // Convert the start date to Pacific Time
      const pacificStartDate = convertToPacificTime(new Date(startDate));
      
      // Create end date as exactly one day after start date in Pacific Time
      const pacificEndDate = new Date(pacificStartDate);
      pacificEndDate.setDate(pacificEndDate.getDate() + 1);

      const url = `${baseUrl}?startDate=${encodeURIComponent(
        pacificStartDate.toISOString()
      )}&endDate=${encodeURIComponent(pacificEndDate.toISOString())}`;

      console.log("Fetch URL:", url);

      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();

        type === "reservation" ? setReservations(data) : setWaitlist(data);
      } else {
        const errorData = await res.json().catch(() => null);
        console.error(`Failed to fetch ${type}:`, {
          status: res.status,
          statusText: res.statusText,
          errorData,
        });
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, {
        error: err,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reservations/delete/${reservationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete reservation");
      }

      handleReservationsChange(
        reservations.filter((res) => res._id !== reservationId)
      );
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  const handleDeleteWalkin = async (walkinId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/walkins/delete/${walkinId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete walk-in");
      }

      handleWaitlistChange(
        waitlist.filter((walk) => walk._id !== walkinId)
      );
    } catch (error) {
      console.error("Error deleting walk-in:", error);
    }
  };

  useEffect(() => {
    fetchTodayReservations(
      "reservation",
      currDateAsDate.toISOString()
    );
    fetchTodayReservations(
      "waitlist",
      currDateAsDate.toISOString()
    );
  }, [currDate]);

  const unassignedReservations = reservations.filter((res) => !res.tableNum);
  const unassignedWaitlist = waitlist.filter((walkin) => !walkin.tableNum);

  const handleReservationsChange = (newReservations: Reservation[]) => {
    setReservations(newReservations);
  };

  const handleWaitlistChange = (newWaitlist: Walkin[]) => {
    setWaitlist(newWaitlist);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 4fr",
        width: "100%",
        height: "100%",
      }}
    >
      <Sidebar
        reservations={unassignedReservations}
        waitlist={unassignedWaitlist}
        onReservationsChange={handleReservationsChange}
        fetchTodayReservations={fetchTodayReservations}
        handleDeleteReservation={handleDeleteReservation}
        handleDeleteWalkin={handleDeleteWalkin}
      />
      <MainPage
        reservations={reservations}
        waitlist={waitlist}
        onReservationsChange={handleReservationsChange}
        onWaitlistChange={handleWaitlistChange}
        fetchTodayReservations={fetchTodayReservations}
        handleDeleteReservation={handleDeleteReservation}
        handleDeleteWalkin={handleDeleteWalkin}
      />
    </div>
  );
}

export default FloorPlan;
