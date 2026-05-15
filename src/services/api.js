import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle common errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const now = new Date().toISOString();
    const isNetworkError = !error.response;
    const status = error.response?.status || null;
    const data = error.response?.data;
    const correlationId =
      data?.error?.correlationId ||
      error.config?.headers?.["x-correlation-id"] ||
      null;

    console.error(`[API ERROR] ${now}`, {
      url: error.config?.url,
      method: error.config?.method,
      status,
      data,
      correlationId,
      message: error.message,
    });

    // determine a friendly message for UI consumption
    let friendlyMessage = "An unexpected error occurred. Please try again.";
    if (isNetworkError)
      friendlyMessage = "Network error. Check your connection.";
    else if (status === 401)
      friendlyMessage = "Your session has expired. Please sign in again.";
    else if (status === 403)
      friendlyMessage = "You do not have permission to perform this action.";
    else if (status === 404) friendlyMessage = "Requested resource not found.";
    else if (status >= 500)
      friendlyMessage = "Server error. Please try again later.";
    else if (data?.error?.message) friendlyMessage = data.error.message;

    // attach normalized info to the error object but keep original error shape
    error.normalized = {
      isNetworkError,
      status,
      code: data?.error?.code || null,
      message: data?.error?.message || error.message,
      friendlyMessage,
      correlationId,
      raw: data,
    };

    return Promise.reject(error);
  },
);

export default api;
