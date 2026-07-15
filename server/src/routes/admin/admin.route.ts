import { Router } from "express";
import {
  requireAdmin,
  requireAuth,
} from "../../middleware/auth";
import { adminCatalogRouter } from "../../features/catalog/admin-catalog.route";
import { ok } from "../../utils/envelope";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/access-check", (_req, res) => {
  res.status(200).json(
    ok({
      message: "Admin access verified.",
    }),
  );
});

adminRouter.use("/catalog", adminCatalogRouter);