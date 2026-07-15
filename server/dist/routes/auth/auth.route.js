"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const express_2 = require("@clerk/express");
const auth_1 = require("../../middleware/auth");
const AsyncHandler_1 = require("../../utils/AsyncHandler");
const AppError_1 = require("../../utils/AppError");
const user_1 = require("../../models/user");
const envelope_1 = require("../../utils/envelope");
exports.authRouter = (0, express_1.Router)();
// ADMIN_EMAILS 
const adminEmails = new Set((process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean));
exports.authRouter.post("/sync", auth_1.requireAuth, (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = (0, express_2.getAuth)(req);
    if (!userId) {
        throw new AppError_1.AppError(401, "Unauthenticated request."); // commenting will cause null typescript error
    }
    const clerkUser = await express_2.clerkClient.users.getUser(userId);
    const primaryEmail = clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId) || clerkUser.emailAddresses[0];
    const email = primaryEmail.emailAddress;
    const fullName = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
    // name is required in the User model; fall back to email
    const name = fullName || clerkUser.username || email;
    const existingUser = await user_1.User.findOne({ clerkUserId: userId });
    const shouldBeAdmin = adminEmails.has(email.toLowerCase());
    const nextRole = existingUser?.role === "admin" || shouldBeAdmin ? "admin" : "user";
    const dbUser = await user_1.User.findOneAndUpdate({ clerkUserId: userId }, { clerkUserId: userId, email, name, role: nextRole }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.status(200).json((0, envelope_1.ok)({
        user: {
            id: dbUser._id,
            clerkUserId: dbUser.clerkUserId,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
        },
    }));
}));
exports.authRouter.get("/me", auth_1.requireAuth, (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = (0, express_2.getAuth)(req);
    if (!userId) {
        throw new AppError_1.AppError(401, "User is not logged in. Means unauth user! !");
    }
    const dbUser = await user_1.User.findOne({ clerkUserId: userId });
    if (!dbUser) {
        throw new AppError_1.AppError(404, "User is not found in DB");
    }
    res.status(200).json((0, envelope_1.ok)({
        user: {
            id: dbUser._id,
            clerkUserId: dbUser.clerkUserId,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
        },
    }));
}));
