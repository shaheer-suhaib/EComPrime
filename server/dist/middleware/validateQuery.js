"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = validateQuery;
const AppError_1 = require("../utils/AppError");
function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const message = result.error.issues
                .map((issue) => {
                const path = issue.path.join(".") || "query";
                return `${path}: ${issue.message}`;
            })
                .join("; ");
            return next(new AppError_1.AppError(400, message));
        }
        res.locals.validatedQuery = result.data;
        next();
    };
}
