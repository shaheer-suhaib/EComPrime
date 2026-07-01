export type ApiEnvelope<T> = {
  status: "success" | "error";
  data?: T;
  meta? : Record<string, unknown>; //unknown>Optional extra info (e.g. pagination, timestamps)
  errors?: Array<{ message: string; code?: string }>;
};   // to avoid duplication

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiEnvelope<T> {
  return { status: "success", data, meta };
}

export function fail(message: string, code?: string): ApiEnvelope<null> {
  return { status: "error", data: null, errors: [{ message, code }] };
}

