import { useState, useEffect } from "react";
import { Title, Button, Loader, Text } from "@mantine/core";
import classes from "../styles/Sidebar.module.scss";
import ReservationForm from "./Reservation";
import { IconPlus } from "@tabler/icons-react";
import { useCurrDate } from "./CurrDateProvider";
import { API_BASE_URL } from '../frontend-config';

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

export function CustomAddButton(
  text: string,
  onClickFunc: () => void,
  date?: Date
) {
  const iconPlusSize = 16;

  function isToday(date: Date) {
    const today = new Date();

    if (date.toString().includes("T")) {
      return (
        date.getFullYear === today.getFullYear &&
        date.getMonth === today.getMonth &&
        date.getDay === today.getDay
      );
    }
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // months are 0-based
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}` === date.toString();
  }

  return (
    <Button
      className={classes.addToWaitlistButton}
      onClick={onClickFunc}
      rightSection={
        <IconPlus size={iconPlusSize} className={classes.plusIcon} />
      }
      disabled={date && !isToday(date)}
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

  const { currDate } = useCurrDate();

  const currDateAsDate = new Date(currDate);
  console.log(currDateAsDate.toISOString());

  const tmrwDate = new Date(
    Date.UTC(
      currDateAsDate.getUTCFullYear(),
      currDateAsDate.getUTCMonth(),
      currDateAsDate.getUTCDate() + 1
    )
  );
  console.log("tmrw", tmrwDate.toISOString());

  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [isLoadingWaitlist, setIsLoadingWaitlist] = useState(false);


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

  const sidebarTitleSize = "1.5rem";

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
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        console.log(data);
        type === "reservation" ? setReservations(data) : setWaitlist(data);

        if (type === "reservation") {
          setIsLoadingReservations(false);
        } else {
          setIsLoadingWaitlist(false);
        }
      } else {
        console.error("Failed to fetch reservations");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      
    }
  };

  const convertDateToTime = (startTime: string | Date) => {
    console.log(startTime);
    const isoString =
      typeof startTime === "string" ? startTime : startTime.toISOString();

    // Extract the time portion
    const timePart = isoString.split("T")[1]; // "17:00:00.000Z"
    const [hourStr, minuteStr] = timePart.split(":"); // ["17", "00"]

    let hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;

    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const formatName = (name: string) => {
    const [first, last] = name.split(" ");
    if (!first || !last) return name;

    return `${first} ${last[0]}.`;
  };

  return (
    <div className={classes.sidebarContainer}>
      {/* {getFormattedDate(new Date(currDate))} */}
      <div className={classes.reservationTitleContainer}>
        <Title style={{ fontSize: sidebarTitleSize }}>Reservations</Title>
        {CustomAddButton("New", () => {
          setShowReservationForm(true);
          setFormType("reservation");
        })}
      </div>


      {showReservationForm && (
        <div>
          <section className={classes.reservationFormContainer}>
            <ReservationForm
              onClose={() => {
                setShowReservationForm(false);
                fetchTodayReservations(
                  formType,
                  currDateAsDate.toISOString(),
                  tmrwDate.toISOString()
                );
              }}
              reservationType={formType}
            />
          </section>
          <div className={classes.grayedBackground}></div>
        </div>
      )}

      {isLoadingReservations ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
          <Loader size="sm" />
          <Text>Loading reservations...</Text>
        </div>
      ) : reservations.length === 0 ? (
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
                <p className={classes.addedAtText}>Time</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <hr style={{ marginTop: "46px" }} />

      <div className={classes.waitlistTitleSection}>
        <Title style={{ fontSize: sidebarTitleSize }}>Waitlist</Title>
        {CustomAddButton(
          "Add to waitlist",
          () => {
            setShowReservationForm(true);
            setFormType("waitlist");
          },
          currDate
        )}
      </div>
      
       {isLoadingWaitlist ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
            <Loader size="sm" />
            <Text>Loading waitlist...</Text>
          </div>
        ) : waitlist.length === 0 ? (
          <p style={{ fontStyle: "italic" }}>No waitlist</p>
        ) : (
         <div className={classes.unassignedWaitContainer}>
          <p style={{ fontStyle: "italic" }}>Drag and drop onto a table</p>
           {waitlist.map((entry, index) => (
      
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
          ))}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
