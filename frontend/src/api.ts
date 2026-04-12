import axios from "axios";

function resolveApiBaseUrl(): string {
  const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

  if (!configuredBaseUrl) {
    return "/api";
  }

  if (typeof window !== "undefined" && window.location.protocol === "https:" && configuredBaseUrl.startsWith("http://")) {
    const httpUrl = new URL(configuredBaseUrl);
    if (httpUrl.hostname !== "localhost" && httpUrl.hostname !== "127.0.0.1") {
      return configuredBaseUrl.replace(/^http:\/\//, "https://");
    }
  }

  return configuredBaseUrl;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

export default api;
