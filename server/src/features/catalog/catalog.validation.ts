import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(
    /^[a-f\d]{24}$/i,
    "Must be a valid MongoDB ObjectId.",
  );

const productImageSchema = z.object({
  url: z.url("Image URL must be valid."),
  publicId: z
    .string()
    .trim()
    .min(1, "Image public ID is required."),
  altText: z
    .string()
    .trim()
    .max(150)
    .default(""),
  sortOrder: z
    .number()
    .int()
    .nonnegative()
    .default(0),
});

const variantAttributeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Attribute name is required.")
    .max(50),
  value: z
    .string()
    .trim()
    .min(1, "Attribute value is required.")
    .max(100),
});

const productVariantSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Variant title is required.")
      .max(120),
    sku: z
      .string()
      .trim()
      .min(1, "SKU is required.")
      .max(80)
      .transform((sku) => sku.toUpperCase()),
    attributes: z
      .array(variantAttributeSchema)
      .default([]),
    priceMinor: z
      .number()
      .int("Price must be an integer.")
      .nonnegative("Price cannot be negative."),
    compareAtPriceMinor: z
      .number()
      .int()
      .nonnegative()
      .nullable()
      .optional(),
    currency: z.literal("PKR").default("PKR"),
    isActive: z.boolean().default(true),
  })
  .superRefine((variant, context) => {
    if (
      variant.compareAtPriceMinor != null &&
      variant.compareAtPriceMinor <= variant.priceMinor
    ) {
      context.addIssue({
        code: "custom",
        path: ["compareAtPriceMinor"],
        message:
          "Compare-at price must be greater than the selling price.",
      });
    }

    const attributeNames = variant.attributes.map(
      (attribute) => attribute.name.toLowerCase(),
    );

    if (
      new Set(attributeNames).size !== attributeNames.length
    ) {
      context.addIssue({
        code: "custom",
        path: ["attributes"],
        message:
          "A variant cannot contain duplicate attribute names.",
      });
    }
  });

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters.")
    .max(80),
  description: z
    .string()
    .trim()
    .max(500)
    .default(""),
  status: z
    .enum(["active", "inactive"])
    .default("active"),
});

export const createProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must contain at least 2 characters.")
      .max(150),
    shortDescription: z
      .string()
      .trim()
      .max(300)
      .default(""),
    description: z
      .string()
      .trim()
      .max(10_000)
      .default(""),
    brand: z
      .string()
      .trim()
      .max(100)
      .default(""),
    categoryId: objectIdSchema,
    images: z
      .array(productImageSchema)
      .max(10, "A product cannot have more than 10 images.")
      .default([]),
    variants: z
      .array(productVariantSchema)
      .min(1, "A product requires at least one variant.")
      .max(100, "A product cannot have more than 100 variants."),
  })
  .superRefine((product, context) => {
    const skus = product.variants.map(
      (variant) => variant.sku,
    );

    if (new Set(skus).size !== skus.length) {
      context.addIssue({
        code: "custom",
        path: ["variants"],
        message:
          "Two variants in the same product cannot use the same SKU.",
      });
    }
  });


export const adminProductListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  status: z
    .enum(["draft", "active", "archived"])
    .optional(),

  categoryId: objectIdSchema.optional(),

  search: z
    .string()
    .trim()
    .max(100)
    .optional(),

  sort: z
    .enum([
      "newest",
      "oldest",
      "name-asc",
      "name-desc",
    ])
    .default("newest"),
});


export const productIdParamsSchema = z.object({
  productId: objectIdSchema,
});

export const updateProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(150),
    shortDescription: z
      .string()
      .trim()
      .max(300),
    description: z
      .string()
      .trim()
      .max(10_000),
    brand: z
      .string()
      .trim()
      .max(100),
    categoryId: objectIdSchema,
    images: z
      .array(productImageSchema)
      .max(10),
    variants: z
      .array(productVariantSchema)
      .min(1)
      .max(100),
  })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message:
        "At least one product field must be provided.",
    },
  );

export type ProductIdParams = z.infer<
  typeof productIdParamsSchema
>;

export type UpdateProductInput = z.infer<
  typeof updateProductSchema
>;

export type AdminProductListQuery = z.infer<
  typeof adminProductListQuerySchema
>;

export type CreateCategoryInput = z.infer<
  typeof createCategorySchema
>;

export type CreateProductInput = z.infer<
  typeof createProductSchema
>;