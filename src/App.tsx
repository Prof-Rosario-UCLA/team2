import React from "react";
import { Flex } from "@mantine/core";
import logo from "./logo.svg";
import "./App.css";
import MainPage from "./components/MainPage";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <Navbar />
      </nav>
      <header
        className="App-header"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 4fr",
          marginTop: "70px",
        }}
      >
        <Sidebar />
        <MainPage />
      </header>
    </div>
  );
}

export default App;
