import { API_BASE_URL } from "../frontend-config";

export const updateReservationTable = async (
    reservationId: string,
    tableNumber: Number
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reservations/updateReservation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reservationId: reservationId,
            tableNum: tableNumber,
          }),
        }
      );
  
      if (response.ok) {
        const updatedReservation = await response.json();
        return updatedReservation;
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };
  
export const updateWalkInTable = async (walkinId: string, tableNumber: Number, time: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/walkins/updateWalkin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walkinId: walkinId,
          tableNum: tableNumber,
          time: time
        }),
      });
  
      if (response.ok) {
        const updatedWalkIn = await response.json();
        return updatedWalkIn;
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };
  