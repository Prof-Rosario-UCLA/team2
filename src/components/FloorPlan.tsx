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
  const tmrwDate = new Date(
    Date.UTC(
      currDateAsDate.getUTCFullYear(),
      currDateAsDate.getUTCMonth(),
      currDateAsDate.getUTCDate() + 1
    )
  );

  const fetchTodayReservations = async (
    type: string,
    startDate: string,
    endDate: string
  ) => {
    
    try {
      const baseUrl =
        type === "reservation"
          ? `${API_BASE_URL}/reservations/range`
          : `${API_BASE_URL}/walkins/range`;

      const url = `${baseUrl}?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`;
      
      console.log('Fetch URL:', url);
      
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();

        type === "reservation" ? setReservations(data) : setWaitlist(data);
      } else {
        const errorData = await res.json().catch(() => null);
        console.error(`Failed to fetch ${type}:`, {
          status: res.status,
          statusText: res.statusText,
          errorData
        });
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error'
      });
    } 
  };

  useEffect(() => {

    fetchTodayReservations(
      "reservation",
      currDateAsDate.toISOString(),
      tmrwDate.toISOString()
    );
    fetchTodayReservations(
      "waitlist",
      currDateAsDate.toISOString(),
      tmrwDate.toISOString()
    );
  }, [currDate]);

  const unassignedReservations = reservations.filter(res => !res.tableNum);
  const unassignedWaitlist = waitlist.filter(walkin => !walkin.tableNum);

  const handleReservationsChange = (newReservations: Reservation[]) => {
    setReservations(newReservations);
  };

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "1fr 4fr",
      width: "100%",
      height: "100%"
    }}>
      <Sidebar 
        reservations={unassignedReservations}
        waitlist={unassignedWaitlist}
        onReservationsChange={handleReservationsChange}
        fetchTodayReservations={fetchTodayReservations}
      />
      <MainPage 
        reservations={reservations}
        onReservationsChange={handleReservationsChange}
        fetchTodayReservations={fetchTodayReservations}
      />
    </div>
  );
}

export default FloorPlan; 