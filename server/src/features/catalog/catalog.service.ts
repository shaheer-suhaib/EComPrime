import type { Types } from "mongoose";
import { AppError } from "../../utils/AppError";
import { createSlug } from "../../utils/createSlug";
import { Category } from "./category.model";
import { Product } from "./product.model";
import type {
  CreateCategoryInput,
  CreateProductInput,
} from "./catalog.validation";


function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isDuplicateKeyError(
  error: unknown,
): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function createCategory(
  input: CreateCategoryInput,
  adminUserId: Types.ObjectId,
) {
  const slug = createSlug(input.name);

  if (!slug) {
    throw new AppError(
      400,
      "Category name cannot generate a valid URL slug.",
    );
  }

  const escapedName = escapeRegex(input.name);

  const existingCategory = await Category.exists({
    $or: [
      { slug },
      {
        name: {
          $regex: `^${escapedName}$`,
          $options: "i",
        },
      },
    ],
  });

  if (existingCategory) {
    throw new AppError(
      409,
      "A category with this name already exists.",
    );
  }

  try {
    return await Category.create({
      ...input,
      slug,
      createdBy: adminUserId,
      updatedBy: adminUserId,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(
        409,
        "A category with this name or slug already exists.",
      );
    }

    throw error;
  }
}

export async function listAdminCategories() {
  return Category.find()
    .sort({ name: 1 })
    .lean();
}



async function generateUniqueProductSlug(name: string) {
  const baseSlug = createSlug(name);

  if (!baseSlug) {
    throw new AppError(
      400,
      "Product name cannot generate a valid URL slug.",
    );
  }

  let slug = baseSlug;
  let suffix = 2;

  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;

    if (suffix > 100) {
      throw new AppError(
        409,
        "Unable to generate a unique product slug.",
      );
    }
  }

  return slug;
}

export async function createProduct(
  input: CreateProductInput,
  adminUserId: Types.ObjectId,
) {
  const categoryExists = await Category.exists({
    _id: input.categoryId,
  });

  if (!categoryExists) {
    throw new AppError(
      400,
      "The selected category does not exist.",
    );
  }

  const requestedSkus = input.variants.map(
    (variant) => variant.sku,
  );

  const existingSku = await Product.exists({
    "variants.sku": {
      $in: requestedSkus,
    },
  });

  if (existingSku) {
    throw new AppError(
      409,
      "One or more SKUs are already used by another product.",
    );
  }

  const slug = await generateUniqueProductSlug(input.name);

  try {
    return await Product.create({
      ...input,
      slug,
      status: "draft",
      createdBy: adminUserId,
      updatedBy: adminUserId,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(
        409,
        "The product slug or one of its SKUs already exists.",
      );
    }

    throw error;
  }
}