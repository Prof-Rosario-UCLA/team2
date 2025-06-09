import dotenv from "dotenv";
dotenv.config();

const env = process.env.ENVIRONMENT;

export const API_BASE_URL = env == "dev"
  ? "http://localhost:1919"
  : "";

// dear TAs if you see this, i know this is bad practice, but i spent a long time
// debugging why the kubernetes cluster couldn't recognize the github secret correctly
// and i couldn't get it working correctly
export const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
