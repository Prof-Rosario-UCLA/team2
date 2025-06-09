import dotenv from "dotenv";
dotenv.config();

const env = process.env.ENVIRONMENT;

export const API_BASE_URL = env == "dev"
  ? "http://localhost:1919"
  : "";

export const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || "";
