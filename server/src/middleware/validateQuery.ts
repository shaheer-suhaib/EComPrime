import type {
  NextFunction,
  Request,
  Response,
} from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError";

export function validateQuery(schema: ZodType) {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => {
          const path = issue.path.join(".") || "query";
          return `${path}: ${issue.message}`;
        })
        .join("; ");

      return next(new AppError(400, message));
    }

    res.locals.validatedQuery = result.data;
    next();
  };
}