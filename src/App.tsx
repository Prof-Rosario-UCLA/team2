import { useEffect, useState } from "react";

import "./App.css";
import FloorPlan from "./components/FloorPlan";
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
          <main
            className="App-header"
            style={{
              paddingTop: "76px",
            }}
          >
            <FloorPlan />
          </main>
        </CurrDateProvider>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
