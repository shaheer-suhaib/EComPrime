export type UserRole = "user" | "admin";

export type AppUser = {
  id: string;
  clerkUserId: string;
  email?: string;
  name?: string;
  role: UserRole;
};

export type ApiErrorItem = {
  message: string;
  code?: string;
};

export type ApiEnvelope<T> = {   //"Every API response has status, data, meta and errors."
  status: "success" | "error";
  data: T | null;
  meta?: Record<string, unknown>;
  errors?: ApiErrorItem[];
};
