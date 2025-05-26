import React, { useState } from "react";
import { Title, Button, ActionIcon } from "@mantine/core";
import classes from "../styles/Sidebar.module.scss";
import ReservationForm from "./Reservation";
import { IconPlus } from "@tabler/icons-react";

function Sidebar() {
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [formType, setFormType] = useState("reservation");
  // const [waitlist, setWaitlist] = useState();

  const iconPlusSize = 16;
  const sidebarTitleSize = "1.5rem";

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
    <div className={classes.sidebarContainer}>
      <div className={classes.reservationTitleContainer}>
        <Title style={{ fontSize: sidebarTitleSize }}>Reservations</Title>
        <Button
          className={classes.createReservationButton}
          onClick={() => {
            setShowReservationForm(true);
            setFormType("reservation");
          }}
          rightSection={
            <IconPlus size={iconPlusSize} className={classes.plusIcon} />
          }
        >
          New
        </Button>
      </div>
      <p style={{ fontStyle: "italic" }}>No new reservations</p>
      <hr style={{ marginTop: "46px" }} />

      {showReservationForm && (
        <div>
          <section className={classes.reservationFormContainer}>
            <ReservationForm
              onClose={() => setShowReservationForm(false)}
              reservationType={formType}
            />
          </section>
          <div className={classes.grayedBackground}></div>
        </div>
      )}
      <div className={classes.waitlistContainer}>
        <div className={classes.waitlistTitleSection}>
          <Title style={{ fontSize: sidebarTitleSize }}>Waitlist</Title>
          <Button
            className={classes.addToWaitlistButton}
            onClick={() => {
              setShowReservationForm(true);
              setFormType("waitlist");
            }}
            rightSection={
              <IconPlus size={iconPlusSize} className={classes.plusIcon} />
            }
          >
            Add to waitlist
          </Button>
        </div>
        {waitlist.length === 0 ? (
          <p>No waitlist</p>
        ) : (
          waitlist.map((entry, index) => (
            <div key={index} className={classes.waitlistItem}>
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
