import { Router } from "express";
import { asyncHandler } from "../../utils/AsyncHandler";
import { validateBody } from "../../middleware/validateBody"; 
import { validateParams } from "../../middleware/validateParams";
import {
  createCategoryController,
  listCategoriesController,
  createProductController,
  listProductsController,
  getProductController,
  updateProductController,
} from "./admin-catalog.controller";

import { createCategorySchema,createProductSchema, adminProductListQuerySchema,productIdParamsSchema, updateProductSchema} from "./catalog.validation";
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

adminCatalogRouter.get(
  "/products/:productId",
  validateParams(productIdParamsSchema),
  asyncHandler(getProductController),
);

adminCatalogRouter.patch(
  "/products/:productId",
  validateParams(productIdParamsSchema),
  validateBody(updateProductSchema),
  asyncHandler(updateProductController),
);