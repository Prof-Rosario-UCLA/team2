import { useState, useEffect } from "react";
import { Title, Button } from "@mantine/core";
import classes from "../styles/Sidebar.module.scss";
import ReservationForm from "./Reservation";
import { IconPlus } from "@tabler/icons-react";

type Reservation = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  tableNum: Number;
  size: Number;
  startTime: Date;
  endTime: Date;
  comments: string;
};

type Walkins = {
  _id: string;
  name: string;
  phoneNumber: string;
  tableNum: Number;
  size: Number;
  timeAddedToWaitlist: Date;
  startTime: Date;
  endTime: Date;
  comments: string;
};

export function CustomAddButton(text: string, onClickFunc: () => void) {
  const iconPlusSize = 16;

  return (
    <Button
      className={classes.addToWaitlistButton}
      onClick={onClickFunc}
      rightSection={
        <IconPlus size={iconPlusSize} className={classes.plusIcon} />
      }
    >
      {text}
    </Button>
  );
}

function Sidebar() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitlist, setWaitlist] = useState<Walkins[]>([]);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [formType, setFormType] = useState("reservation");

  useEffect(() => {
    fetchReservations("reservation");
    fetchReservations("waitlist");
  }, []);

  const sidebarTitleSize = "1.5rem";

  const fetchReservations = async (type: string) => {
    try {
      const res = await fetch(
        type === "reservation"
          ? "http://localhost:1919/reservations/"
          : "http://localhost:1919/walkins/"
      );
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        type === "reservation" ? setReservations(data) : setWaitlist(data);
      } else {
        console.error("Failed to fetch reservations");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const convertDateToTime = (startTime: string | Date) => {
    const date = new Date(startTime);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12h format
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // convert 0 to 12

    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const formatName = (name: string) => {
    const [first, last] = name.split(" ");
    if (!first || !last) return name;

    return `${first} ${last[0]}.`;
  };

  return (
    <div className={classes.sidebarContainer}>
      <div className={classes.reservationTitleContainer}>
        <Title style={{ fontSize: sidebarTitleSize }}>Reservations</Title>
        {CustomAddButton("New", () => {
          setShowReservationForm(true);
          setFormType("reservation");
        })}
      </div>

      {reservations.length === 0 ? (
        <p style={{ fontStyle: "italic" }}>No new reservations</p>
      ) : (
        <div className={classes.unassignedResContainer}>
          <p style={{ fontStyle: "italic" }}>Drag and drop onto a table</p>
          {reservations.map((res) => (
            <div key={res._id} className={classes.reservationItem}>
              <div>
                <p className={classes.waitlistItemName}>
                  {formatName(res.name)}
                </p>
                <p className={classes.numPartyText}>
                  Party of {res.size.valueOf()}
                </p>
              </div>
              <div>
                <p className={classes.waitlistItemTime}>
                  {convertDateToTime(res.startTime)}
                </p>
                <p className={classes.addedAtText}>Time created</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <hr style={{ marginTop: "46px" }} />

      {showReservationForm && (
        <div>
          <section className={classes.reservationFormContainer}>
            <ReservationForm
              onClose={() => {
                setShowReservationForm(false);
                fetchReservations(formType);
              }}
              reservationType={formType}
            />
          </section>
          <div className={classes.grayedBackground}></div>
        </div>
      )}
      <div className={classes.waitlistContainer}>
        <div className={classes.waitlistTitleSection}>
          <Title style={{ fontSize: sidebarTitleSize }}>Waitlist</Title>
          {CustomAddButton("Add to waitlist", () => {
            setShowReservationForm(true);
            setFormType("waitlist");
          })}
        </div>
        {waitlist.length === 0 ? (
          <p style={{ fontStyle: "italic" }}>No waitlist</p>
        ) : (
          waitlist.map((entry, index) => (
            <div key={index} className={classes.waitlistItem}>
              <div>
                <p className={classes.waitlistItemName}>
                  {formatName(entry.name)}
                </p>
                <p className={classes.numPartyText}>
                  Party of {entry.size.valueOf()}
                </p>
              </div>
              <div>
                <p className={classes.waitlistItemTime}>
                  {convertDateToTime(entry.timeAddedToWaitlist)}
                </p>
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
