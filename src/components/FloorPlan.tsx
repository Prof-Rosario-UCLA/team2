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

  // const convertToPacificTime = (date: Date) => {
  //   return new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  // };

  const fetchTodayReservations = async (
    type: string,
    startDate: string
  ) => {
    try {
      const baseUrl =
        type === "reservation"
          ? `${API_BASE_URL}/reservations/range`
          : `${API_BASE_URL}/walkins/range`;

      console.log('Time Conversion Debug:', {
        originalStartDate: startDate,
        originalStartDateType: typeof startDate,
        originalStartDateObject: new Date(startDate).toString()
      });

      // Extract just the date part (YYYY-MM-DD) from the input
      const dateOnly = startDate.split('T')[0];
      console.log('Extracted date:', dateOnly);

      // Create start of day in Pacific time
      const pacificStartDate = new Date(`${dateOnly}T00:00:00-07:00`);
      
      console.log('Pacific Time Start of Day:', {
        pacificStartDate: pacificStartDate.toString(),
        pacificStartDateISO: pacificStartDate.toISOString(),
        pacificStartDateTimezone: pacificStartDate.getTimezoneOffset()
      });
      
      // Create end of day in Pacific time (23:59:59.999)
      const pacificEndDate = new Date(`${dateOnly}T23:59:59.999-07:00`);

      console.log('Pacific Time End of Day:', {
        pacificEndDate: pacificEndDate.toString(),
        pacificEndDateISO: pacificEndDate.toISOString(),
        pacificEndDateTimezone: pacificEndDate.getTimezoneOffset(),
        timeDifference: pacificEndDate.getTime() - pacificStartDate.getTime()
      });

      const url = `${baseUrl}?startDate=${encodeURIComponent(
        pacificStartDate.toISOString()
      )}&endDate=${encodeURIComponent(pacificEndDate.toISOString())}`;

      console.log("Fetch URL:", url);
      console.log("Decoded URL parameters:", {
        startDate: decodeURIComponent(url.split('startDate=')[1].split('&')[0]),
        endDate: decodeURIComponent(url.split('endDate=')[1])
      });

      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        console.log(`Successfully fetched ${type}:`, {
          count: data.length,
          firstItem: data[0],
          lastItem: data[data.length - 1]
        });

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
