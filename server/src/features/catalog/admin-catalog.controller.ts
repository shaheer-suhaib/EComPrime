import type { Request, Response } from "express";
import type { Types } from "mongoose";
import { AppError } from "../../utils/AppError";
import { ok } from "../../utils/envelope";
import type {
  CreateCategoryInput,
  CreateProductInput,
} from "./catalog.validation";

import {
  createCategory,
  createProduct,
  listAdminCategories,
} from "./catalog.service";


export async function createCategoryController(
  req: Request,
  res: Response,
) {
  const adminUser = res.locals.dbUser;

  if (!adminUser) {
    throw new AppError(
      500,
      "Authenticated admin context is missing.",
    );
  }

  const category = await createCategory(
    req.body as CreateCategoryInput,
    adminUser._id as Types.ObjectId,
  );

  res.status(201).json(
    ok({
      category,
    }),
  );
}

export async function listCategoriesController(
  _req: Request,
  res: Response,
) {
  const categories = await listAdminCategories();

  res.status(200).json(
    ok({
      categories,
    }),
  );
}


export async function createProductController(
  req: Request,
  res: Response,
) {
  const adminUser = res.locals.dbUser;

  if (!adminUser) {
    throw new AppError(
      500,
      "Authenticated admin context is missing.",
    );
  }

  const product = await createProduct(
    req.body as CreateProductInput,
    adminUser._id as Types.ObjectId,
  );

  res.status(201).json(
    ok({
      product,
    }),
  );
}

