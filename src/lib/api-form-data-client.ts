import { getAccessToken } from "@/lib/auth-session";
import { refreshCustomerSession } from "@/lib/api-client";
import { API_URL } from "../config/env";

const API_BASE_URL = API_URL;
const API_PUBLIC_KEY = import.meta.env.VITE_API_KEY;

export const apiFormDataClient = async (
  endpoint: string,
  formData: FormData,
) => {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined");
  }

  const token = getAccessToken();

  try {
    const headers: Record<string, string> = {
      "x-api-key": API_PUBLIC_KEY || "",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Note: Don't set Content-Type for FormData with fetch,
    // browser will set it automatically with boundary

    let res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    if (res.status === 401) {
      const refreshedSession = await refreshCustomerSession();

      if (refreshedSession?.token) {
        headers["Authorization"] = `Bearer ${refreshedSession.token}`;
        res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers,
          body: formData,
          credentials: "include",
        });
      }
    }

    const data = await res.json();

    if (!res.ok) {
      throw data;
    }

    return data;
  } catch (err: any) {
    // Error normalization
    const errorResponse = err?.message
      ? err
      : {
          message: err?.message || "Unknown error occurred",
        };

    throw errorResponse;
  }
};
