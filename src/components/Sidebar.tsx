import React, { useState } from "react";
import { Title } from "@mantine/core";
import classes from "../styles/Sidebar.module.scss";
import ReservationForm from "./Reservation";

function Sidebar() {
  const [showReservationForm, setShowReservationForm] = useState(false);
  // const [waitlist, setWaitlist] = useState();

  interface waitlistEntry {
    name: string;
    numPeople: number;
    timeCreated: string;
  }

  const waitlist: waitlistEntry[] = [
    { name: "Bob", numPeople: 2, timeCreated: "5:55" },
    { name: "Bab", numPeople: 2, timeCreated: "5:56" },
    { name: "Bub", numPeople: 2, timeCreated: "5:59" },
  ];

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
        }}
      >
        Create Reservation
      </button>

      {/* Have this stay in the sidebar, no popup? */}
      {showReservationForm && (
        <section className={classes.reservationFormContainer}>
          <ReservationForm onClose={() => setShowReservationForm(false)} />
        </section>
      )}
      <div className={classes.waitlistContainer}>
        <div className={classes.waitlistTitleSection}>
          <Title style={{ fontSize: "2rem", marginLeft: 12 }}>Waitlist</Title>
          <button
            className={classes.addToWaitlistButton}
            onClick={() => {
              setShowReservationForm(true);
            }}
          >
            Add to waitlist
          </button>
        </div>
        {waitlist.length === 0 ? (
          <p>No waitlist</p>
        ) : (
          waitlist.map((entry, index) => (
            <div className={classes.waitlistItem}>
              <div>
                <p className={classes.waitlistItemName}>{entry.name}</p>
                <p className={classes.numPartyText}>
                  Party of {entry.numPeople}
                </p>
              </div>
              <div>
                <p className={classes.waitlistItemTime}>{entry.timeCreated}</p>
                <p className={classes.addedAtText}>Time created</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
