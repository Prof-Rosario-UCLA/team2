import { Title } from "@mantine/core";
import React, { useState } from "react";
import "../styles/Navbar.scss";

function Navbar() {
  return (
    <nav
      style={{
        width: "100%",
        height: "70px",
        backgroundColor: "green",
      }}
    >
      <div className="navbar-container">
        <Title style={{ fontSize: "2rem" }}>ReserveEase</Title>
        <div className="navbar-right-options">
          <p>Floor Plan</p>
          <p>Reservations</p>
          <p>Reports</p>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
