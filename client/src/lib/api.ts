import axios, { type AxiosRequestConfig } from "axios";
import type { ApiEnvelope } from "./types";
import { env } from "./env";

const api = axios.create({
  baseURL: env.backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
});


let tokenGetter: (() => Promise<string | null>) | null = null;   // as get-tooken is hook and can be used in components only, 

export function setApiTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

api.interceptors.request.use(async (config) => {
  if (!tokenGetter) return config;

  const token = await tokenGetter();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function getErrorMsg(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      "Request failed"
    );
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong!!! Please try again";
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig) {   // for unwrapipng the data from the api response, we can use this function instead of using api.get directly. 
  try {
    const response = await api.get<ApiEnvelope<T>>(url, config);

    if (response.data.status === "error" || !response.data.data) {
      throw new Error(response.data.errors?.[0]?.message || "Request failed");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMsg(error));
  }
}