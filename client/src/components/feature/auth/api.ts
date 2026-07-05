// called a service. Its job is simply to make API requests. It hides the Axios details from the rest of app
import { apiGet, apiPost } from "@/lib/api";
import type { MeResponse, SyncResponse } from "./types";

export function syncUser() {
  return apiPost<SyncResponse>("/auth/sync");
}

export function getMe() {
  return apiGet<MeResponse>("/auth/me");
}
