import React from "react";
import { Flex } from "@mantine/core";

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

      <section
        className="App-header"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 4fr",
          paddingTop: "76px",
        }}
      >
        <Sidebar />
        <MainPage />
      </section>
    </div>
  );
}

export default App;
