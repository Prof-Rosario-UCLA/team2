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
import { CustomAddButton } from "./Sidebar";
import { useCurrDate } from "./CurrDateProvider";
import { IconCalendarWeek } from "@tabler/icons-react";

interface CalendarIconTriggerProps {
  currDate: Date;
  setCurrDate: (date: Date) => void;
}

type Table = {
  tableNumber: Number;
  tableCapacity: Number;
  comments: String;
};

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
  const [selectedTime, setSelectedTime] = useState(0);
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

  const fetchTables = async () => {
    try {
      const res = await fetch("http://localhost:1919/tables/");
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
      const response = await fetch("http://localhost:1919/tables/create", {
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

  interface Table {
    name: string;
    minNumber: number;
    maxNumber: number;
  }

  const tableItemWidth = 1.58;

  const times = Array.from({ length: 21 }, (_, i) => {
    const totalMinutes = 17 * 60 + i * 15; // Start at 5 PM (17:00)
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hour12 = hours > 12 ? hours - 12 : hours;
    const period = hours >= 12 ? "pm" : "am";
    return `${hour12}:${minutes.toString().padStart(2, "0")}${period}`;
  });

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

  // const tables: Table[] = [
  //   { name: "Table 1", minNumber: 2, maxNumber: 4 },
  //   { name: "Table 2", minNumber: 4, maxNumber: 6 },
  //   { name: "Table 3", minNumber: 6, maxNumber: 8 },
  //   { name: "Table 4", minNumber: 2, maxNumber: 10 },
  //   { name: "Table 5", minNumber: 1, maxNumber: 2 },
  //   { name: "Table 6", minNumber: 4, maxNumber: 6 },
  //   { name: "Table 1", minNumber: 2, maxNumber: 4 },
  //   { name: "Table 2", minNumber: 4, maxNumber: 6 },
  //   { name: "Table 3", minNumber: 6, maxNumber: 8 },
  //   { name: "Table 4", minNumber: 2, maxNumber: 10 },
  //   { name: "Table 5", minNumber: 1, maxNumber: 2 },
  //   { name: "Table 6", minNumber: 4, maxNumber: 6 },
  // ];

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

      {CustomAddButton("Add a table", () => {
        setAddTableForm(true);
      })}
      <Grid className={classes.tableContainer}>
        {tables.map((table, index) => (
          <Grid.Col key={index} span={tableItemWidth}>
            <div className={classes.tableItem}>
              <h6 className={classes.tableItemTitle}>
                Table {table.tableNumber} ({table.tableCapacity})
              </h6>
            </div>
          </Grid.Col>
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
