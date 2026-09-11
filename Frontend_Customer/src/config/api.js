// Dynamic API & Socket Configuration
const getDynamicHost = () => {
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    return window.location.hostname;
  }
  return "localhost";
};

const currentHost = getDynamicHost();
const envApiBase = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL;

export const API_BASE = (() => {
  if (envApiBase) {
    // If accessing from mobile or local network IP, replace localhost with current hostname
    if (
      envApiBase.includes("localhost") &&
      currentHost !== "localhost" &&
      currentHost !== "127.0.0.1"
    ) {
      return envApiBase.replace("localhost", currentHost);
    }
    return envApiBase;
  }
  return `http://${currentHost}/quickibite/BB%20backend/api`;
})();

export const API_BASE_URL = API_BASE;

export const SOCKET_URL = (() => {
  const envSocket = import.meta.env.VITE_SOCKET_URL;
  if (envSocket) {
    if (
      envSocket.includes("localhost") &&
      currentHost !== "localhost" &&
      currentHost !== "127.0.0.1"
    ) {
      return envSocket.replace("localhost", currentHost);
    }
    return envSocket;
  }
  return `http://${currentHost}:3001`;
})();
