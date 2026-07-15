import 'dotenv/config';
import { connectToDatabase } from "./db";
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { ok } from "./utils/envelope";
import { clerkMiddleware } from '@clerk/express';
import { authRouter } from "./routes/auth/auth.route";
import { adminRouter } from "./routes/admin/admin.route";
async function entryPoint() {
    await connectToDatabase();
    const app = express();
    
    
    const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.use(
        cors({
        origin: corsOrigins,
        credentials: true,
        }),
    );

   
    
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(clerkMiddleware())
  app.get("/health", (_req, res) => {
        res.status(200).json(ok({ message: "Server is healthy/in running state" }));
    });


  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFound);
  app.use(errorHandler);

  const port = Number(process.env.PORT);

  app.listen(port, () => {
    console.log(`Server is now listening to port ${port}`);
  });

}

entryPoint().catch((err) => {
  console.error("failed to start", err);
  process.exit(1); 
});
