import React, { useState } from "react";
import { Title } from "@mantine/core";
import classes from "../styles/Sidebar.module.scss";
import ReservationForm from "./Reservation";

function Sidebar() {
  const [showReservationForm, setShowReservationForm] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "#e0e0e0",
        height: "100%",
        color: "black",
        paddingTop: "20px",
      }}
    >
      <Title style={{ fontSize: "2rem", marginBottom: 10 }}>
        New Reservation
      </Title>
      <button
        className={classes.createReservationButton}
        onClick={() => {
          setShowReservationForm(true);
          console.log("clicked");
        }}
      >
        Create Reservation
      </button>

      {showReservationForm && (
        <section className={classes.reservationFormContainer}>
          <ReservationForm onClose={() => setShowReservationForm(false)} />
        </section>
      )}
    </div>
  );
}

export default Sidebar;
