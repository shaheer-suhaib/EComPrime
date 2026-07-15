import type { Types, QueryFilter, SortOrder, } from "mongoose";
import { AppError } from "../../utils/AppError";
import { createSlug } from "../../utils/createSlug";
import { Category } from "./category.model";
import { Product } from "./product.model";
import type {
  CreateCategoryInput,
  CreateProductInput,
  AdminProductListQuery
} from "./catalog.validation";

import type { ProductDocument } from "./product.model";


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


// listing service


export async function listAdminProducts(
  query: AdminProductListQuery,
) {
  const filter: QueryFilter<ProductDocument> = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.categoryId) {
    filter.categoryId = query.categoryId;
  }

  if (query.search) {
    const search = escapeRegex(query.search);

    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        brand: {
          $regex: search,
          $options: "i",
        },
      },
      {
        "variants.sku": {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const sortOptions: Record<
    AdminProductListQuery["sort"],
    Record<string, SortOrder>
  > = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "name-asc": { name: 1 },
    "name-desc": { name: -1 },
  };

  const skip = (query.page - 1) * query.limit;

  const [documents, total] = await Promise.all([
    Product.find(filter)
      .select(
        [
          "name",
          "slug",
          "brand",
          "status",
          "categoryId",
          "images",
          "variants.title",
          "variants.sku",
          "variants.priceMinor",
          "variants.currency",
          "createdAt",
          "updatedAt",
        ].join(" "),
      )
      .populate(
        "categoryId",
        "name slug status",
      )
      .sort(sortOptions[query.sort])
      .skip(skip)
      .limit(query.limit)
      .lean(),

    Product.countDocuments(filter),
  ]);

  const products = documents.map((product) => {
    const activePrices = product.variants
      .filter((variant) => variant.priceMinor != null)
      .map((variant) => variant.priceMinor);

    const minPriceMinor =
      activePrices.length > 0
        ? Math.min(...activePrices)
        : null;

    return {
      ...product,
      thumbnail: product.images[0] ?? null,
      variantCount: product.variants.length,
      minPriceMinor,
    };
  });

  return {
    products,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}