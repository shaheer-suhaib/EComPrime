import { Router } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { validateBody } from "../../middleware/validateBody";
import {
  createCategoryController,
  listCategoriesController,
  createProductController,
  listProductsController,
} from "./admin-catalog.controller";

import { createCategorySchema,createProductSchema, adminProductListQuerySchema} from "./catalog.validation";
import { validateQuery } from "../../middleware/validateQuery";

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

adminCatalogRouter.get(
  "/products",
  validateQuery(adminProductListQuerySchema),
  asyncHandler(listProductsController),
);