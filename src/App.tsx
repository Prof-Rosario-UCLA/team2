import React from "react";
import { Button, Text, Group } from "@mantine/core";
import logo from "./logo.svg";
import "./App.css";
import ReservationForm from "./components/Reservation";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <ReservationForm />
      </header>
    </div>
  );
}

export default App;
