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
    console.log(`=== FETCHING ${type.toUpperCase()} ===`);
    console.log('Start date:', startDate);
    console.log('End date:', endDate);
    
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
        console.log(`Successfully fetched ${type}:`, data);
        console.log(`Number of ${type} items:`, data.length);
        console.log(`${type} with tableNum:`, data.filter((item: Reservation | Walkin) => item.tableNum).length);
        console.log(`${type} without tableNum:`, data.filter((item: Reservation | Walkin) => !item.tableNum).length);
        
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
    } finally {
      console.log(`=== COMPLETED ${type.toUpperCase()} FETCH ===`);
    }
  };

  useEffect(() => {
    console.log('=== INITIAL FETCH TRIGGERED ===');
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

  // Filter out reservations that have been assigned to tables
  const unassignedReservations = reservations.filter(res => !res.tableNum);
  const unassignedWaitlist = waitlist.filter(walkin => !walkin.tableNum);

  console.log('=== CURRENT STATE ===');
  console.log('Total reservations:', reservations.length);
  console.log('Unassigned reservations:', unassignedReservations.length);
  console.log('Total waitlist:', waitlist.length);
  console.log('Unassigned waitlist:', unassignedWaitlist.length);

  const handleReservationsChange = (newReservations: Reservation[]) => {
    console.log('=== RESERVATIONS UPDATED ===');
    console.log('Previous reservations:', reservations.length);
    console.log('New reservations:', newReservations.length);
    setReservations(newReservations);
    // Trigger a re-fetch to ensure both components are in sync
    fetchTodayReservations(
      "reservation",
      currDateAsDate.toISOString(),
      tmrwDate.toISOString()
    );
  };

  const handleWaitlistChange = (newWaitlist: Walkin[]) => {
    console.log('=== WAITLIST UPDATED ===');
    console.log('Previous waitlist:', waitlist.length);
    console.log('New waitlist:', newWaitlist.length);
    setWaitlist(newWaitlist);
    // Trigger a re-fetch to ensure both components are in sync
    fetchTodayReservations(
      "waitlist",
      currDateAsDate.toISOString(),
      tmrwDate.toISOString()
    );
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
        onWaitlistChange={handleWaitlistChange}
        fetchTodayReservations={fetchTodayReservations}
      />
      <MainPage 
        reservations={reservations}
        waitlist={waitlist}
        onReservationsChange={handleReservationsChange}
        onWaitlistChange={handleWaitlistChange}
        fetchTodayReservations={fetchTodayReservations}
      />
    </div>
  );
}

export default FloorPlan; 