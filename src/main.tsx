import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./frontend-config.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <DndProvider backend={HTML5Backend}>
          <App />
        </DndProvider>
      </GoogleOAuthProvider>
    </MantineProvider>
  </StrictMode>
);
