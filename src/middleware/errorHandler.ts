import type { NextFunction, Request, Response } from "express";
import { fail } from "../utils/envelope";
import { AppError } from "../utils/AppError";
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(fail(err.message, "APP_ERROR"))
  }

  console.error("error", err);

  return res.status(500).json(fail("Internal server error", "INTERNAL"));
}