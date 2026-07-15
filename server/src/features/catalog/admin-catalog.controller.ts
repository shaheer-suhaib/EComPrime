import type { Request, Response } from "express";
import type { Types } from "mongoose";
import { AppError } from "../../utils/AppError";
import { ok } from "../../utils/envelope";
import type {
  AdminProductListQuery,
  CreateCategoryInput,
  CreateProductInput,
  ProductIdParams,
  UpdateProductInput,
} from "./catalog.validation";

import {
  createCategory,
  createProduct,
  listAdminCategories,
  listAdminProducts,
  getAdminProductById,
  updateProduct,
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

export async function listProductsController(
  _req: Request,
  res: Response,
) {
  const query =
    res.locals.validatedQuery as AdminProductListQuery;

  const result = await listAdminProducts(query);

  res.status(200).json(
    ok(
      {
        products: result.products,
      },
      result.pagination,
    ),
  );
}


export async function getProductController(
  _req: Request,
  res: Response,
) {
  const { productId } =
    res.locals.validatedParams as ProductIdParams;

  const product = await getAdminProductById(productId);

  res.status(200).json(
    ok({
      product,
    }),
  );
}

export async function updateProductController(
  req: Request,
  res: Response,
) {
  const { productId } =
    res.locals.validatedParams as ProductIdParams;

  const adminUser = res.locals.dbUser;

  if (!adminUser) {
    throw new AppError(
      500,
      "Authenticated admin context is missing.",
    );
  }

  const product = await updateProduct(
    productId,
    req.body as UpdateProductInput,
    adminUser._id as Types.ObjectId,
  );

  res.status(200).json(
    ok({
      product,
    }),
  );
}