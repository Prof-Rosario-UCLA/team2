import classes from "../styles/MainPage.module.scss";
import { Grid, ScrollArea, Title, Popover } from "@mantine/core";
import { DatesProvider, DatePicker } from "@mantine/dates";
import { useState } from "react";
import { CustomAddButton } from "./Sidebar";
import { IconCalendarWeek } from "@tabler/icons-react";

interface CalendarIconTriggerProps {
  currDate: Date;
  setCurrDate: (date: Date) => void;
}

function CalendarIconTrigger({
  currDate,
  setCurrDate,
}: CalendarIconTriggerProps) {
  const [opened, setOpened] = useState(false);

  const handleDateChange = (date: Date) => {
    setCurrDate(date);
    setOpened(false); // auto-close popover after selection
  };

  return (
    <DatesProvider settings={{ locale: "en", firstDayOfWeek: 0 }}>
      <Popover
        opened={opened}
        onChange={setOpened}
        position="bottom-start"
        withArrow
        shadow="md"
        trapFocus
      >
        <Popover.Target>
          <IconCalendarWeek
            className={classes.calendarIcon}
            onClick={() => setOpened((o) => !o)}
            style={{ cursor: "pointer" }}
          />
        </Popover.Target>
        <Popover.Dropdown>
          <DatePicker
            value={currDate}
            onChange={handleDateChange as any}
            minDate={new Date()}
            maxDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
            defaultLevel="month"
            // allowSingleDateInRange={false}
            // amountOfMonths={1}
            size="sm"
            styles={{
              day: {
                fontWeight: 500,
              },
            }}
          />
        </Popover.Dropdown>
      </Popover>
    </DatesProvider>
  );
}

interface Table {
  name: string;
  minNumber: number;
  maxNumber: number;
  currentReservation?: WaitlistItem;
}

interface WaitlistItem {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  partySize: number;
  time: string;
}

function MainPage() {
  const [selectedTime, setSelectedTime] = useState(0);
  const [currDate, setCurrDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const formattedDate = (() => {
    try {
      let date = currDate instanceof Date ? currDate : new Date(currDate);

      // If the date seems to be affected by timezone, adjust it
      const offset = date.getTimezoneOffset();
      date = new Date(date.getTime() + offset * 60 * 1000);

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  })();

  const tableItemWidth = 1.58;

  const times = Array.from({ length: 21 }, (_, i) => {
    const totalMinutes = 17 * 60 + i * 15; // Start at 5 PM (17:00)
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hour12 = hours > 12 ? hours - 12 : hours;
    const period = hours >= 12 ? "pm" : "am";
    return `${hour12}:${minutes.toString().padStart(2, "0")}${period}`;
  });

  const [tables, setTables] = useState<Table[]>([
    { name: "Table 1", minNumber: 2, maxNumber: 4 },
    { name: "Table 2", minNumber: 4, maxNumber: 6 },
    { name: "Table 3", minNumber: 6, maxNumber: 8 },
    { name: "Table 4", minNumber: 2, maxNumber: 10 },
    { name: "Table 5", minNumber: 1, maxNumber: 2 },
    { name: "Table 6", minNumber: 4, maxNumber: 6 },
    { name: "Table 1", minNumber: 2, maxNumber: 4 },
    { name: "Table 2", minNumber: 4, maxNumber: 6 },
    { name: "Table 3", minNumber: 6, maxNumber: 8 },
    { name: "Table 4", minNumber: 2, maxNumber: 10 },
    { name: "Table 5", minNumber: 1, maxNumber: 2 },
    { name: "Table 6", minNumber: 4, maxNumber: 6 },
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, tableIndex: number) => {
    e.preventDefault();
    const waitlistItem = JSON.parse(e.dataTransfer.getData('waitlistItem')) as WaitlistItem;
    
    // Check if party size is within table limits
    const table = tables[tableIndex];
    if (waitlistItem.partySize < table.minNumber || waitlistItem.partySize > table.maxNumber) {
      alert(`Party size must be between ${table.minNumber} and ${table.maxNumber} for this table`);
      return;
    }

    try {
      // Update MongoDB
      const response = await fetch('http://localhost:1919/walkins/assign-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          waitlistId: waitlistItem.id,
          tableNumber: table.name,
          date: currDate.toISOString(),
          time: times[selectedTime]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign table');
      }

      // Update local state
      const newTables = [...tables];
      newTables[tableIndex] = {
        ...newTables[tableIndex],
        currentReservation: waitlistItem
      };
      setTables(newTables);

    } catch (error) {
      console.error('Error assigning table:', error);
      alert('Failed to assign table. Please try again.');
    }
  };

  return (
    <div className={classes.mainPageContainer}>
      <div
        style={{
          width: "fit-content",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Title>Floor Plan - {formattedDate}</Title>
        {/* <IconCalendarWeek className={classes.calendarIcon} /> */}
        <CalendarIconTrigger currDate={currDate} setCurrDate={setCurrDate} />
      </div>

      {/* Outer container with fixed width (or max width) */}
      <div style={{ width: 0, minWidth: "100%", overflow: "hidden" }}>
        <ScrollArea
          type="hover"
          scrollbarSize={6}
          style={{ position: "relative", zIndex: 1 }}
          // className={classes.customScrollArea}
        >
          {/* Inner flex container with width larger than parent to enable scroll */}
          <div style={{ display: "flex", gap: "16px", width: "max-content" }}>
            {times.map((time, index) => (
              <button
                key={index}
                className={
                  index === selectedTime
                    ? classes.timeItemSelected
                    : classes.timeItem
                }
                onClick={() => setSelectedTime(index)}
              >
                {time}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {CustomAddButton("Add a table", () => {})}
      <Grid className={classes.tableContainer}>
        {tables.map((table, index) => (
          <Grid.Col key={index} span={tableItemWidth}>
            <div 
              className={classes.tableItem}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <h6 className={classes.tableItemTitle}>
                {table.name} ({table.minNumber}-{table.maxNumber})
              </h6>
              {table.currentReservation && (
                <div className={classes.currentReservation}>
                  <p>{table.currentReservation.firstname} {table.currentReservation.lastname}</p>
                  <p>Party of {table.currentReservation.partySize}</p>
                </div>
              )}
            </div>
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
}

export default MainPage;
