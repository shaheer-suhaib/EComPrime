import { Router } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { validateBody } from "../../middleware/validateBody";
import {
  createCategoryController,
  listCategoriesController,
  createProductController,
} from "./admin-catalog.controller";

import { createCategorySchema,createProductSchema, } from "./catalog.validation";

export const adminCatalogRouter = Router();

adminCatalogRouter.get(
  "/categories",
  asyncHandler(listCategoriesController),
);

adminCatalogRouter.post(
  "/categories",
  validateBody(createCategorySchema),
  asyncHandler(createCategoryController),
);

adminCatalogRouter.post(
  "/products",
  validateBody(createProductSchema),
  asyncHandler(createProductController),
);