import { Router } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/AsyncHandler";
import { AppError } from "../../utils/AppError";
import { User } from "../../models/user";
import { ok } from "../../utils/envelope";

export const authRouter = Router();

// ADMIN_EMAILS 
const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
);

authRouter.post(
  "/sync",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      throw new AppError(401, "Unauthenticated request.");   // commenting will cause null typescript error
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const primaryEmail =
      clerkUser.emailAddresses.find(
        (item) => item.id === clerkUser.primaryEmailAddressId,
      ) || clerkUser.emailAddresses[0];

    const email = primaryEmail.emailAddress;

    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    // name is required in the User model; fall back to email
    const name = fullName || clerkUser.username || email;

   
    const existingUser = await User.findOne({ clerkUserId: userId });
    const shouldBeAdmin = adminEmails.has(email.toLowerCase());
    const nextRole =
      existingUser?.role === "admin" || shouldBeAdmin ? "admin" : "user";

    const dbUser = await User.findOneAndUpdate(
      { clerkUserId: userId },
      { clerkUserId: userId, email, name, role: nextRole },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.status(200).json(
      ok({
        user: {
          id: dbUser._id,
          clerkUserId: dbUser.clerkUserId,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        },
      }),
    );
  }),
);



authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      throw new AppError(401, "User is not logged in. Means unauth user! !");
    }

    const dbUser = await User.findOne({ clerkUserId: userId });

    if (!dbUser) {
      throw new AppError(404, "User is not found in DB");
    }

    res.status(200).json(
      ok({
        user: {
          id: dbUser._id,
          clerkUserId: dbUser.clerkUserId,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        },
      }),
    );
  }),
);
