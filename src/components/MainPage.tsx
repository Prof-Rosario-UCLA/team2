import classes from "../styles/MainPage.module.scss";
import {
  Grid,
  ScrollArea,
  Title,
  Popover,
  NumberInput,
  Textarea,
  Button,
} from "@mantine/core";
import { DatesProvider, DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { useDrop, useDragLayer } from "react-dnd";
import { CustomAddButton, convertDateToTime, formatName } from "./Sidebar";
import type { Reservation, Walkin, DragItem } from "./Sidebar";
import { useCurrDate } from "./CurrDateProvider";
import { IconCalendarWeek } from "@tabler/icons-react";
import { API_BASE_URL } from "../frontend-config";

const tableItemWidth = 1.58;

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
  reservation: Reservation | Walkin;
}

type TableDropProps = {
  table: Table;
  onDrop: (item: DragItem) => void;
};

export const TableDrop: React.FC<TableDropProps> = ({ table, onDrop }) => {
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(
    () => ({
      accept: "BOX",
      drop: (item) => onDrop(item),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    })
  );

  return (
    <Grid.Col span={tableItemWidth}>
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={classes.tableItem}
        style={{ backgroundColor: isOver ? "#f0f0f0" : undefined }}
      >
        <h6 className={classes.tableItemTitle}>
          Table {table.tableNumber.valueOf()} ({table.tableCapacity})
        </h6>
        {!table.reservation && <p style={{ fontSize: "1rem" }}>nothing here</p>}
        {table.reservation && (
          <div
            className={
              "email" in table.reservation
                ? classes.tableReservationContainer
                : classes.tableWalkinContainer
            }
          >
            <p
              className={
                "email" in table.reservation
                  ? classes.tableReservationItem
                  : classes.tableWalkinItem
              }
            >
              {formatName(table.reservation.name)}
            </p>
            <p style={{ color: "#555" }}>
              Party Size: {table.reservation.size.valueOf()}
            </p>
          </div>
        )}
      </div>
    </Grid.Col>
  );
};

const updateReservationTable = async (
  reservationId: string,
  tableNumber: Number
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reservations/updateReservation`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationId: reservationId, // This is the _id field
          tableNum: tableNumber,
        }),
      }
    );

    if (response.ok) {
      const updatedReservation = await response.json();
      return updatedReservation;
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};

// function addItemToTable(table: Table, item: DragItem): Table {
//   if ("reservation" in item) {
//     if (!table.reservation) {
//       return { ...table, reservation: item.reservation };
//     } else {
//       console.log("Cannot add reservation to occupied table");
//       return table;
//     }
//   } else {
//     if (!table.reservation) {
//       return { ...table, reservation: item.walkin };
//     } else {
//       console.log("Cannot add walkin to occupied table");
//       return table;
//     }
//   }
// }

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

function MainPage() {
  const [selectedTime, setSelectedTime] = useState(times[0]);
  const [tables, setTables] = useState<Table[]>([]);
  const [addTableForm, setAddTableForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currDate, setCurrDate } = useCurrDate();

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (tables.length > 0) {
      form.setFieldValue("tableNum", tables.length + 1);
    }
  }, [tables]);

  useEffect(() => {
    // update the tables and their associated reservations when selectedTime changes
  }, [selectedTime]);

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

    // return (
    //   <div
    //     style={{
    //       position: "fixed",
    //       top: 0,
    //       right: 0,
    //       padding: 10,
    //       zIndex: 1000,
    //     }}
    //   >
    //     <strong>Dragging:</strong> {reservation.name} (
    //     {convertDateToTime(reservation.startTime)})
    //   </div>
    // );
  };

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
        // setSubmitted(true);
      } else {
        const error = await response.json();
        console.error("Submission error:", error);
        // Handle error
      }
    } catch (error) {
      console.error("Submission error:", error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  // const [currDate, setCurrDate] = useState<Date>(() => {
  //   const today = new Date();
  //   return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // });
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
              setTables((prevTables) => {
                const currentTable = prevTables[index];

                if (currentTable.reservation) {
                  console.log("Cannot add to occupied table");
                  return prevTables; // Return unchanged
                }

                const newTables = [...prevTables];
                newTables[index] = {
                  ...currentTable,
                  reservation:
                    "reservation" in item ? item.reservation : item.walkin,
                };

                if ("reservation" in item) {
                  updateReservationTable(
                    item.reservation._id,
                    table.tableNumber
                  );
                }
                return newTables;
              });
            }}
          />
        ))}
      </Grid>
      {addTableForm && (
        <div className={classes.addTableFormContainer}>
          <Title>Add a table</Title>
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
      {addTableForm && <div className={classes.grayedBackground}></div>}
    </div>
  );
}

export default MainPage;
