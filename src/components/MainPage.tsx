import classes from "../styles/MainPage.module.scss";
import { Grid, ScrollArea, Title } from "@mantine/core";

function MainPage() {
  const times = new Array(27).fill("5:00pm");

  return (
    <div className={classes.mainPageContainer}>
      <Title>Floor Plan</Title>

      {/* Outer container with fixed width (or max width) */}
      <div style={{ width: 0, minWidth: "100%", overflow: "hidden" }}>
        <ScrollArea type="hover" scrollbarSize={6}>
          {/* Inner flex container with width larger than parent to enable scroll */}
          <div style={{ display: "flex", gap: "16px", width: "max-content" }}>
            {times.map((time, index) => (
              <div
                key={index}
                style={{ whiteSpace: "nowrap", minWidth: "60px" }}
              >
                {time}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Grid className={classes.tableContainer}>
        <Grid.Col span={2}>1</Grid.Col>
        <Grid.Col span={2}>2</Grid.Col>
        <Grid.Col span={2}>3</Grid.Col>
        <Grid.Col span={2}>4</Grid.Col>
      </Grid>
    </div>
  );
}

export default MainPage;
