"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const AppError_1 = require("../utils/AppError");
function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const message = result.error.issues
                .map((issue) => {
                const path = issue.path.join(".") || "body";
                return `${path}: ${issue.message}`;
            })
                .join("; ");
            return next(new AppError_1.AppError(400, message));
        }
        req.body = result.data;
        next();
    };
}
