import { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { Title, Button, Loader, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import classes from "../styles/Sidebar.module.scss";
import ReservationForm from "./Reservation";
import { IconPlus } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";
import { useCurrDate } from "./CurrDateProvider";

export type Reservation = {
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

export type Walkin = {
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

export type DragItem =
  | {
      type: "BOX";
      reservation: Reservation;
    }
  | {
      type: "BOX";
      walkin: Walkin;
    };

export function convertDateToTime(startTime: string | Date): string {
  console.log('convertDateToTime input:', startTime);
  
  // Convert to Date object if it's a string
  const date = typeof startTime === "string" ? new Date(startTime) : startTime;
  console.log('Initial date object:', date);
  
  // Convert to Pacific time
  const pacificTime = new Date(date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles"
  }));

  // Get hours and minutes
  let hours = pacificTime.getHours();
  const minutes = pacificTime.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  const result = `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  console.log('Final formatted time:', result);
  return result;
}

export const formatName = (name: string) => {
  const [first, last] = name.split(" ");
  if (!first || !last) return name;

  return `${first} ${last[0]}.`;
};

const DraggableReservation = ({
  reservation,
  onDragEnd,
}: {
  reservation: Reservation;
  onDragEnd: () => void;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BOX",
    item: { type: "BOX", reservation } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      onDragEnd();
    },
  }));
  const getsSquished = useMediaQuery("(max-width: 650px)");

  if (getsSquished) {
    return (
      <div
        className={classes.reservationItem}
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <div>
          <p className={classes.waitlistItemName}>
            {formatName(reservation.name)}
          </p>
          <p className={classes.waitlistItemTime}>
            {convertDateToTime(reservation.startTime)}
          </p>
        </div>
        <div>
          <p className={classes.addedAtText}>({reservation.size.valueOf()})</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classes.reservationItem}
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div>
        <p className={classes.waitlistItemName}>
          {formatName(reservation.name)}
        </p>
        <p className={classes.numPartyText}>
          Party of {reservation.size.valueOf()}
        </p>
      </div>
      <div>
        <p className={classes.waitlistItemTime}>
          {convertDateToTime(reservation.startTime)}
        </p>
        <p className={classes.addedAtText}>Time</p>
      </div>
    </div>
  );
};

const DraggableWaitlist = ({
  walkin,
  onDragEnd,
}: {
  walkin: Walkin;
  onDragEnd: () => void;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BOX",
    item: { type: "BOX", walkin } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      onDragEnd();
    },
  }));
  const getsSquished = useMediaQuery("(max-width: 650px)");

  if (getsSquished) {
    return (
      <div
        className={classes.waitlistItem}
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <div>
          <p className={classes.waitlistItemName}>{formatName(walkin.name)}</p>
          <p className={classes.waitlistItemTime}>
            {convertDateToTime(walkin.timeAddedToWaitlist)}
          </p>
        </div>
        <div>
          <p className={classes.addedAtText}>({walkin.size.valueOf()})</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classes.waitlistItem}
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div>
        <p className={classes.waitlistItemName}>{formatName(walkin.name)}</p>
        <p className={classes.numPartyText}>Party of {walkin.size.valueOf()}</p>
      </div>
      <div>
        <p className={classes.waitlistItemTime}>
          {convertDateToTime(walkin.timeAddedToWaitlist)}
        </p>
        <p className={classes.addedAtText}>Time created</p>
      </div>
    </div>
  );
};

export function CustomAddButton(
  text: string,
  onClickFunc: () => void,
  date?: Date
) {
  const getsSquished = useMediaQuery("(max-width: 800px)");
  const iconPlusSize = getsSquished ? 14 : 16;

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

interface SidebarProps {
  reservations: Reservation[];
  waitlist: Walkin[];
  onReservationsChange: (reservations: Reservation[]) => void;
  fetchTodayReservations: (
    type: string,
    startDate: string,
    endDate: string
  ) => Promise<void>;
  handleDeleteReservation: (reservationID: string) => void;
  handleDeleteWalkin: (walkinID: string) => void;
}

function Sidebar({
  reservations,
  waitlist,
  handleDeleteReservation,
  handleDeleteWalkin,
  fetchTodayReservations 
}: SidebarProps) {
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [formType, setFormType] = useState("reservation");
  const { currDate } = useCurrDate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const IconTrashSize = 20;

  const currDateAsDate = new Date(currDate);
  const tmrwDate = new Date(
    Date.UTC(
      currDateAsDate.getUTCFullYear(),
      currDateAsDate.getUTCMonth(),
      currDateAsDate.getUTCDate() + 1
    )
  );

  // Filter out reservations that are assigned to tables
  const unassignedReservations = reservations.filter(
    (res) => !res.tableNum || res.tableNum === 0
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className={classes.sidebarContainer}>
      <section>
        <header className={classes.reservationTitleContainer}>
          <Title className={classes.sidebarTitle}>Reservations</Title>
          {CustomAddButton("New", () => {
            setShowReservationForm(true);
            setFormType("reservation");
          })}
        </header>

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

        {isOffline ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem",
            }}
          >
            <Loader size="sm" />
            <Text>Loading reservations...</Text>
          </div>
        ) : unassignedReservations.length === 0 ? (
          <p className={classes.italicText}>No reservations</p>
        ) : (
          <div>
            <p className={classes.italicText}>Drag and drop onto a table</p>
            <div className={classes.unassignedResContainer}>
              {unassignedReservations.map((res) => (
                <div key={res._id} className={classes.resItemContainer}>
                  <DraggableReservation
                    reservation={res}
                    onDragEnd={() => {
                      fetchTodayReservations(
                        "reservation",
                        currDateAsDate.toISOString(),
                        tmrwDate.toISOString()
                      );
                    }}
                  />
                  <IconTrash
                    size={IconTrashSize}
                    className={classes.trashIcon}
                    onClick={() => handleDeleteReservation(res._id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <hr style={{ marginTop: "46px" }} />
      </section>

      <section>
        <header className={classes.waitlistTitleSection}>
          <Title className={classes.sidebarTitle}>Waitlist</Title>
          {CustomAddButton(
            "Add to waitlist",
            () => {
              setShowReservationForm(true);
              setFormType("waitlist");
            },
            currDate
          )}
        </header>

        {isOffline ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem",
            }}
          >
            <Loader size="sm" />
            <Text>Loading waitlist...</Text>
          </div>
        ) : waitlist.length === 0 ? (
          <p className={classes.italicText}>No waitlist</p>
        ) : (
          <div>
            <p className={classes.italicText}>Drag and drop onto a table</p>
            <div className={classes.unassignedWaitContainer}>
              {waitlist.map((entry) => (
                <div key={entry._id} className={classes.waitlistItemContainer}>
                  <DraggableWaitlist
                    walkin={entry}
                    onDragEnd={() => {
                      fetchTodayReservations(
                        "waitlist",
                        currDateAsDate.toISOString(),
                        tmrwDate.toISOString()
                      );
                    }}
                  />

                  <IconTrash
                    size={IconTrashSize}
                    className={classes.trashIcon}
                    onClick={() => handleDeleteWalkin(entry._id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Sidebar;
