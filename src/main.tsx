import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <GoogleOAuthProvider clientId="499257456410-dk3qd2oeum2rdm3adh08p04o0ft0afms.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </MantineProvider>
  </StrictMode>
);
