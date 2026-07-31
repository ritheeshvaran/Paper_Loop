import axios from "axios";

const configured = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
/** In dev, use CRA proxy (`src/setupProxy.js`). In production, require REACT_APP_BACKEND_URL. */
export const BACKEND_URL =
  process.env.NODE_ENV === "production" ? configured : configured || "";
export const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

if (process.env.NODE_ENV === "production" && !BACKEND_URL) {
  console.error(
    "[Paper & Loop] REACT_APP_BACKEND_URL is missing. Set it in Vercel env vars so API calls reach FastAPI instead of this static site.",
  );
}

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pl_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
