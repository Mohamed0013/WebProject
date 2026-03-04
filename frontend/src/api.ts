import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/api", // Laravel API
  withCredentials: true,                 // needed for Sanctum auth
});

export default api;
