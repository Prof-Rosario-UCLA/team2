import { Grid, Title, NumberInput, Textarea, Button, ScrollArea, Popover } from '@mantine/core';
import { DatesProvider, DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import classes from "../styles/MainPage.module.scss";
import { useDrop, useDrag, useDragLayer } from "react-dnd";
import { CustomAddButton, convertDateToTime, formatName } from "./Sidebar";
import type { Reservation, Walkin, DragItem } from "./Sidebar";
import { useCurrDate } from "./CurrDateProvider";
import { IconCalendarWeek } from "@tabler/icons-react";
import { API_BASE_URL } from "../frontend-config";
import {
  updateReservationTable,
  updateWalkInTable,
} from "../utils/mainpageUtils";
import { IconTrash } from "@tabler/icons-react";
import { getReservationsForTable, getWalkInsForTable } from '../utils/reservationUtils';
import { isReservationActiveAtTime } from '../utils/reservationUtils';

const times = Array.from({ length: 21 }, (_, i) => {
  const totalMinutes = 17 * 60 + i * 15; // Start at 5 PM (17:00)
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hour12 = hours > 12 ? hours - 12 : hours;
  const period = hours >= 12 ? "pm" : "am";
  return `${hour12}:${minutes.toString().padStart(2, "0")}${period}`;
});

interface CalendarIconTriggerProps {
  currDate: Date;
  setCurrDate: (date: Date) => void;
}

interface Table {
  tableNumber: Number;
  tableCapacity: number;
  comments: string;
  reservation: Reservation | Walkin | null;
}

type TableDropProps = {
  table: Table;
  onDrop: (item: DragItem) => void;
};

function formatToTime(dateInput: string | Date | null): string {
  if (!dateInput) return "";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  // Check if date is valid
  if (isNaN(date.getTime())) return "";

  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  return `${hours}:${minutes.toString().padStart(2, "0")}${ampm}`;
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

interface MainPageProps {
  reservations: Reservation[];
  waitlist: Walkin[];
  onReservationsChange: (reservations: Reservation[]) => void;
  onWaitlistChange: (waitlist: Walkin[]) => void;
  fetchTodayReservations: (
    type: string,
    startDate: string,
    endDate: string
  ) => Promise<void>;
  handleDeleteReservation: (reservationId: string) => void;
  handleDeleteWalkin: (walkinId: string) => void;
}

function MainPage({
  reservations,
  waitlist,
  onReservationsChange,
  onWaitlistChange,
  handleDeleteReservation,
  handleDeleteWalkin,
  fetchTodayReservations,
}: MainPageProps) {
  const [selectedTime, setSelectedTime] = useState(times[0]);
  const [tables, setTables] = useState<Table[]>([]);
  const [addTableForm, setAddTableForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currDate, setCurrDate } = useCurrDate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  const currDateAsDate = new Date(currDate);
  const tmrwDate = new Date(
    Date.UTC(
      currDateAsDate.getUTCFullYear(),
      currDateAsDate.getUTCMonth(),
      currDateAsDate.getUTCDate() + 1
    )
  );
  const IconTrashSize = 20;

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (tables.length > 0) {
      form.setFieldValue("tableNum", tables.length + 1);
    }
  }, [tables]);

  useEffect(() => {
    const updatedTables = tables.map((table) => {
      const matchingRes = reservations.find(
        (resEntry) =>
          resEntry.tableNum === table.tableNumber &&
          formatToTime(resEntry.startTime) <= selectedTime &&
          formatToTime(resEntry.endTime) > selectedTime
      );

      // If no reservation, check for a waitlist item
      if (!matchingRes) {
        const matchingWaitlist = waitlist.find(
          (waitlistEntry) =>
            waitlistEntry.tableNum === table.tableNumber &&
            formatToTime(waitlistEntry.startTime) <= selectedTime &&
            formatToTime(waitlistEntry.endTime) > selectedTime
        );
        return {
          ...table,
          reservation: matchingWaitlist ?? null,
        };
      }

      return {
        ...table,
        reservation: matchingRes,
      };
    });

    setTables(updatedTables);
  }, [selectedTime, reservations, waitlist, tables.length]);

  const GlobalDragMonitor = () => {
    const { isDragging, reservation } = useDragLayer((monitor) => {
      const item = monitor.getItem() as DragItem | null;
      return {
        isDragging: monitor.isDragging(),
        reservation: item && "reservation" in item ? item.reservation : null,
        walkin: item && "walkin" in item ? item.walkin : null,
      };
    });

    useEffect(() => {
      if (isDragging && reservation) {
        setSelectedTime(
          convertDateToTime(reservation.startTime)
            .toLowerCase()
            .replace(/\s/g, "")
        );
      }
    }, [isDragging, reservation]);

    if (!isDragging || !reservation) return null;
  };

  useEffect(() => {
    // Refetch reservations when time slot changes
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
  }, [selectedTime]);

  const fetchTables = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tables/`);
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      } else {
        console.error("Failed to fetch reservations");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleSubmit = async (values: any) => {
    console.log(values);
    try {
      const response = await fetch(`${API_BASE_URL}/tables/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        form.reset();
        fetchTables();
        setErrorMessage("");
        // setSubmitted(true);
      } else {
        const error = await response.json();
        console.error("Submission error:", error);
        setErrorMessage(
          error.message || "Something went wrong. Please try again."
        );
        // Handle error
      }
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage("Network error. Please try again.");
      // Handle error
    } finally {
      setLoading(false);
    }
  };

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

  const form = useForm({
    initialValues: {
      tableNum: 1,
      maxCapacity: 2,
      numberTables: 1,
      comments: "",
    },

    validate: {
      tableNum: (value: Number) =>
        value.valueOf() < 1 ? "Table number must be positive" : null,
      maxCapacity: (value: Number) =>
        value.valueOf() < 1 ? "Table capacity must be positive" : null,
      numberTables: (value: Number) =>
        value.valueOf() < 1 ? "Must create a positive number of tables" : null,
    },
  });

  const TableDrop: React.FC<TableDropProps> = ({ table, onDrop }) => {
    const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(
      () => ({
        accept: "BOX",
        drop: (item: DragItem) => {
          onDrop(item);
        },
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      }),
      [table.tableNumber, onDrop]
    );

    const [{ isDragging }, drag] = useDrag({
      type: "BOX",
      item: () => {
        if (!table.reservation) return {} as DragItem;

        if ("email" in table.reservation) {
          return {
            type: "BOX",
            reservation: table.reservation,
          };
        } else {
          return {
            type: "BOX",
            walkin: table.reservation,
          };
        }
      },
      canDrag: !!table.reservation,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3, lg: 2, xl: 2 }}>
        <div
          ref={drop as unknown as React.Ref<HTMLDivElement>}
          className={classes.tableItem}
          style={{
            backgroundColor: isOver ? "#f0f0f0" : undefined,
            opacity: isDragging ? 0.5 : 1,
          }}
        >
          <h6 className={classes.tableItemTitle}>
            Table {table.tableNumber.valueOf()} ({table.tableCapacity})
          </h6>

          {!table.reservation && (
            <p style={{ fontSize: "1rem" }}>nothing here</p>
          )}

          {table.reservation && (
            <div
              ref={drag as unknown as React.Ref<HTMLDivElement>}
              className={
                "email" in table.reservation
                  ? classes.tableReservationContainer
                  : classes.tableWalkinContainer
              }
              style={{ cursor: "move" }}
            >
              <div
                className={
                  "email" in table.reservation
                    ? classes.tableReservationItem
                    : classes.tableWalkinItem
                }
              >
                {formatName(table.reservation.name)}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <p
                  style={{
                    color: "#555",
                    fontSize: "14px",
                    marginRight: "8px",
                  }}
                >
                  Party Size: {table.reservation.size.valueOf()}
                </p>

                <IconTrash
                  size={IconTrashSize}
                  className={classes.plusIcon}
                  onClick={() =>
                    table.reservation &&
                    !isDragging &&
                    ("email" in table.reservation
                      ? handleDeleteReservation(table.reservation._id)
                      : handleDeleteWalkin(table.reservation._id))
                  }
                />
              </div>
            </div>
          )}
        </div>
      </Grid.Col>
    );
  };

  function convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(/(?=[ap]m)/);
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier.toLowerCase() === 'pm') {
      hours = String(parseInt(hours, 10) + 12);
    }
    
    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  return (
    <div className={classes.mainPageContainer}>
      <GlobalDragMonitor />
      <div
        style={{
          width: "fit-content",
          display: "flex",
          alignItems: "center",
        }}
      >
        <header>
          <Title className={classes.mainTitle}>
            Floor Plan - {formattedDate}
          </Title>
        </header>
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
                  time === selectedTime
                    ? classes.timeItemSelected
                    : classes.timeItem
                }
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {CustomAddButton("Add a table", () => {
        setAddTableForm(true);
      })}
      <Grid className={classes.tableContainer}>
        {tables.map((table, index) => (
          <TableDrop
            key={index}
            table={table}
            onDrop={(item) => {
              // Check for conflicting reservations within 2 hours
              console.log('Creating date with:', {
                currDate: currDate,
                selectedTime: selectedTime
              });
              
              if (!currDate) {
                console.error('Current date is null');
                return;
              }

              const time24h = convertTo24Hour(selectedTime);
              const selectedDateTime = new Date(`${currDate.toISOString().split('T')[0]}T${time24h}:00.000Z`);
              
              if (isNaN(selectedDateTime.getTime())) {
                console.error('Invalid selectedDateTime created');
                return;
              }

              // Check table capacity first
              if (
                "reservation" in item &&
                item.reservation &&
                item.reservation.size.valueOf() > table.tableCapacity
              ) {
                console.log("Reservation is too big");
                setErrorPopupMessage(`Table ${table.tableNumber} cannot accommodate a party of ${item.reservation.size.valueOf()}`);
                setShowErrorPopup(true);
                return;
              }
              if (
                "walkin" in item &&
                item.walkin &&
                item.walkin.size.valueOf() > table.tableCapacity
              ) {
                setErrorPopupMessage(`Table ${table.tableNumber} cannot accommodate a party of ${item.walkin.size.valueOf()}`);
                setShowErrorPopup(true);
                return;
              }
              
              const twoHoursLater = new Date(selectedDateTime.getTime() + 2 * 60 * 60 * 1000);
              
              // Get all reservations and walk-ins for this table
              const tableReservations = getReservationsForTable(reservations, Number(tables[index].tableNumber));
              const tableWalkIns = getWalkInsForTable(waitlist, Number(tables[index].tableNumber));
              
              // Check for conflicts in both reservations and walk-ins
              console.log('Checking for conflicts:');
              console.log('Item being moved:', item);

              const hasConflict = [...tableReservations, ...tableWalkIns].some(entry => {
                console.log('\nChecking entry:', entry);
                
                if ('reservation' in item && entry._id === item.reservation._id) {
                  console.log('Skipping - same reservation');
                  return false;
                }
                if ('walkin' in item && entry._id === item.walkin._id) {
                  console.log('Skipping - same walk-in');
                  return false;
                }
                
                const isConflictAtSelectedTime = isReservationActiveAtTime(entry, selectedDateTime);
                const isConflictAtTwoHours = isReservationActiveAtTime(entry, twoHoursLater);
                const isConflict = isConflictAtSelectedTime || isConflictAtTwoHours;
                console.log('Selected time (UTC):', selectedDateTime.toISOString());
                console.log('Two hours later (UTC):', twoHoursLater.toISOString());
                console.log('Entry start time (UTC):', new Date(entry.startTime).toISOString());
                console.log('Entry end time (UTC):', new Date(entry.endTime).toISOString());
                console.log('Conflict at selected time:', isConflictAtSelectedTime);
                console.log('Conflict at two hours later:', isConflictAtTwoHours);
                console.log('Final conflict result:', isConflict);
                return isConflict;
              });

              console.log('Final conflict result:', hasConflict);

              if (hasConflict) {
                console.error("Cannot place reservation: There is a conflicting reservation or walk-in within 2 hours");
                setErrorPopupMessage("Cannot place reservation: There is a conflicting reservation or walk-in within 2 hours");
                setShowErrorPopup(true);
                return;
              }

              // Step 1: Update the tables state to reflect the new arrangement
              // This gives immediate visual feedback to the user
              setTables((prevTables) => {
                const newTables = prevTables.map((table) => {
                  // If this table has the reservation/walk-in we're moving,
                  // clear it from this table
                  if (
                    table.reservation &&
                    (("reservation" in item &&
                      "email" in table.reservation &&
                      table.reservation._id === item.reservation._id) ||
                      ("walkin" in item &&
                        !("email" in table.reservation) &&
                        table.reservation._id === item.walkin._id))
                  ) {
                    return { ...table, reservation: null };
                  }
                  // If this is the target table, add the reservation/walk-in to it
                  if (table.tableNumber === prevTables[index].tableNumber) {
                    return {
                      ...table,
                      reservation:
                        "reservation" in item ? item.reservation : item.walkin,
                    };
                  }
                  return table;
                });
                return newTables;
              });

              // Step 2: Update the reservation/walk-in data to reflect the new table assignment
              if ("reservation" in item) {
                // For reservations: Update the reservation's table number in our local state
                const updatedReservations = reservations.map((res) =>
                  res._id === item.reservation._id
                    ? { ...res, tableNum: tables[index].tableNumber }
                    : res
                );
                onReservationsChange(updatedReservations);

                // Step 3: Persist the change to the backend
                // After successful backend update, re-fetch to ensure data consistency
                updateReservationTable(
                  item.reservation._id,
                  tables[index].tableNumber
                ).then(() => {
                  fetchTodayReservations(
                    "reservation",
                    currDateAsDate.toISOString(),
                    tmrwDate.toISOString()
                  );
                });
              } else {
                // For walk-ins: Update the walk-in's table number in our local state
                const updatedWaitlist = waitlist.map((w) =>
                  w._id === item.walkin._id
                    ? { ...w, tableNum: tables[index].tableNumber }
                    : w
                );
                onWaitlistChange(updatedWaitlist);

                // Step 3: Persist the change to the backend
                // Only update start time if it's not already set
                const walkinToUpdate = waitlist.find(
                  (w) => w._id === item.walkin._id
                );
                const shouldUpdateTime = !walkinToUpdate?.startTime;

                updateWalkInTable(
                  item.walkin._id,
                  tables[index].tableNumber,
                  shouldUpdateTime ? selectedTime : ""
                ).then(() => {
                  fetchTodayReservations(
                    "waitlist",
                    currDateAsDate.toISOString(),
                    tmrwDate.toISOString()
                  );
                });
              }
            }}
          />
        ))}
      </Grid>
      {addTableForm && (
        <div className={classes.addTableFormContainer}>
          <Title>Add a table</Title>
          {errorMessage && (
            <div style={{ color: "red", marginTop: "10px" }}>
              {errorMessage}
            </div>
          )}
          <button
            className={classes.closeButton}
            onClick={() => setAddTableForm(false)}
          >
            X
          </button>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <NumberInput
              label="Table Number"
              required
              min={1}
              {...form.getInputProps("tableNum")}
            />

            <NumberInput
              label="Table Capacity"
              required
              min={1}
              {...form.getInputProps("maxCapacity")}
              mt="md"
            />

            {/* <NumberInput
              label="# of Tables to Create"
              required
              min={1}
              {...form.getInputProps("numberTables")}
              mt="md"
            /> */}

            <Textarea
              label="Comments"
              autosize
              minRows={2}
              {...form.getInputProps("comments")}
              mt="md"
            />

            <div className={classes.submitContainer}>
              <Button type="submit" loading={loading}>
                Submit
              </Button>
            </div>
          </form>
        </div>
      )}
      {showErrorPopup && (
        <div className={classes.addTableFormContainer}>
          <Title order={2}>Error</Title>
          <p>{errorPopupMessage}</p>
          <button className={classes.closeButton} onClick={() => setShowErrorPopup(false)}>
            X
          </button>
        </div>
      )}
      {showErrorPopup && <div className={classes.grayedBackground}></div>}
    </div>
  );
}

export default MainPage;
