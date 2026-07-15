"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("./db");
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const notFound_1 = require("./middleware/notFound");
const errorHandler_1 = require("./middleware/errorHandler");
const envelope_1 = require("./utils/envelope");
const express_2 = require("@clerk/express");
const auth_route_1 = require("./routes/auth/auth.route");
const admin_route_1 = require("./routes/admin/admin.route");
async function entryPoint() {
    await (0, db_1.connectToDatabase)();
    const app = (0, express_1.default)();
    const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.use((0, cors_1.default)({
        origin: corsOrigins,
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use((0, morgan_1.default)("dev"));
    app.use((0, express_2.clerkMiddleware)());
    app.get("/health", (_req, res) => {
        res.status(200).json((0, envelope_1.ok)({ message: "Server is healthy/in running state" }));
    });
    app.use("/api/auth", auth_route_1.authRouter);
    app.use("/api/admin", admin_route_1.adminRouter);
    app.use(notFound_1.notFound);
    app.use(errorHandler_1.errorHandler);
    const port = Number(process.env.PORT);
    app.listen(port, () => {
        console.log(`Server is now listening to port ${port}`);
    });
}
entryPoint().catch((err) => {
    console.error("failed to start", err);
    process.exit(1);
});
