import React, { useEffect, useState } from "react";
import { Flex } from "@mantine/core";

import "./App.css";
import MainPage from "./components/MainPage";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import { CurrDateProvider } from "./components/CurrDateProvider";

import LoginPage from "./components/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token"); // or check cookie/session if that's how you're storing auth
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      <nav className="navbar">
        <Navbar />
      </nav>
      {isLoggedIn ? (
        <CurrDateProvider>
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
        </CurrDateProvider>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
