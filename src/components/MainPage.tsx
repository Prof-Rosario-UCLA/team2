import classes from "../styles/MainPage.module.scss";
import { Grid, ScrollArea, Title } from "@mantine/core";
import { useState } from "react";

function MainPage() {
  const [selectedTime, setSelectedTime] = useState(0);
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  const tables: Table[] = [
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
  ];

  return (
    <div className={classes.mainPageContainer}>
      <Title>Floor Plan - {formattedDate}</Title>

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

      <Grid className={classes.tableContainer}>
        {tables.map((table, index) => (
          <Grid.Col key={index} span={tableItemWidth}>
            <div className={classes.tableItem}>
              <h6 className={classes.tableItemTitle}>
                {table.name} ({table.minNumber}-{table.maxNumber})
              </h6>
            </div>
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
}

export default MainPage;
