import React, { useState } from "react";
import { Title } from "@mantine/core";
import "../styles/Sidebar.scss";
import ReservationForm from "./Reservation";

function Sidebar() {
  const [showReservationForm, setShowReservationForm] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "#e0e0e0",
        height: "100%",
        color: "black",
        paddingTop: 30,
      }}
    >
      <Title style={{ fontSize: "2rem", marginBottom: 10 }}>
        New Reservation
      </Title>
      <button
        className="create-reservation-button"
        onClick={() => {
          setShowReservationForm(true);
          console.log("clicked");
        }}
      >
        Create Reservation
      </button>

      {showReservationForm && (
        <section className="reservation-form-container">
          <ReservationForm onClose={() => setShowReservationForm(false)} />
        </section>
      )}
    </div>
  );
}

export default Sidebar;
