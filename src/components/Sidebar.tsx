import { useState, useEffect } from "react";
import { Title, Button } from "@mantine/core";
import classes from "../styles/Sidebar.module.scss";
import ReservationForm from "./Reservation";
import { IconPlus } from "@tabler/icons-react";
import { WaitlistItem } from "./WaitlistItem";

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

interface WaitlistEntry {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  partySize: number;
  time: string;
}

function Sidebar() {
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [formType, setFormType] = useState("reservation");
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);

  const sidebarTitleSize = "1.5rem";

  // Fetch waitlist items when component mounts
  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        const response = await fetch('http://localhost:1919/walkins');
        if (response.ok) {
          const data = await response.json();
          setWaitlist(data);
        }
      } catch (error) {
        console.error('Error fetching waitlist:', error);
      }
    };

    fetchWaitlist();
    // Set up polling to refresh waitlist every 30 seconds
    const interval = setInterval(fetchWaitlist, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={classes.sidebarContainer}>
      <div className={classes.reservationTitleContainer}>
        <Title style={{ fontSize: sidebarTitleSize }}>Reservations</Title>
        {CustomAddButton("New", () => {
          setShowReservationForm(true);
          setFormType("reservation");
        })}
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
          {CustomAddButton("Add to waitlist", () => {
            setShowReservationForm(true);
            setFormType("waitlist");
          })}
        </div>
        {waitlist.length === 0 ? (
          <p>No waitlist</p>
        ) : (
          <div className={classes.waitlistItemsContainer}>
            {waitlist.map((entry) => (
              <WaitlistItem
                key={entry.id}
                id={entry.id}
                firstname={entry.firstname}
                lastname={entry.lastname}
                phone={entry.phone}
                partySize={entry.partySize}
                time={entry.time}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
