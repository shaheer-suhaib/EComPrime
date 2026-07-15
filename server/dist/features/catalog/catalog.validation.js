"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminProductListQuerySchema = exports.createProductSchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
const objectIdSchema = zod_1.z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Must be a valid MongoDB ObjectId.");
const productImageSchema = zod_1.z.object({
    url: zod_1.z.url("Image URL must be valid."),
    publicId: zod_1.z
        .string()
        .trim()
        .min(1, "Image public ID is required."),
    altText: zod_1.z
        .string()
        .trim()
        .max(150)
        .default(""),
    sortOrder: zod_1.z
        .number()
        .int()
        .nonnegative()
        .default(0),
});
const variantAttributeSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, "Attribute name is required.")
        .max(50),
    value: zod_1.z
        .string()
        .trim()
        .min(1, "Attribute value is required.")
        .max(100),
});
const productVariantSchema = zod_1.z
    .object({
    title: zod_1.z
        .string()
        .trim()
        .min(1, "Variant title is required.")
        .max(120),
    sku: zod_1.z
        .string()
        .trim()
        .min(1, "SKU is required.")
        .max(80)
        .transform((sku) => sku.toUpperCase()),
    attributes: zod_1.z
        .array(variantAttributeSchema)
        .default([]),
    priceMinor: zod_1.z
        .number()
        .int("Price must be an integer.")
        .nonnegative("Price cannot be negative."),
    compareAtPriceMinor: zod_1.z
        .number()
        .int()
        .nonnegative()
        .nullable()
        .optional(),
    currency: zod_1.z.literal("PKR").default("PKR"),
    isActive: zod_1.z.boolean().default(true),
})
    .superRefine((variant, context) => {
    if (variant.compareAtPriceMinor != null &&
        variant.compareAtPriceMinor <= variant.priceMinor) {
        context.addIssue({
            code: "custom",
            path: ["compareAtPriceMinor"],
            message: "Compare-at price must be greater than the selling price.",
        });
    }
    const attributeNames = variant.attributes.map((attribute) => attribute.name.toLowerCase());
    if (new Set(attributeNames).size !== attributeNames.length) {
        context.addIssue({
            code: "custom",
            path: ["attributes"],
            message: "A variant cannot contain duplicate attribute names.",
        });
    }
});
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Category name must contain at least 2 characters.")
        .max(80),
    description: zod_1.z
        .string()
        .trim()
        .max(500)
        .default(""),
    status: zod_1.z
        .enum(["active", "inactive"])
        .default("active"),
});
exports.createProductSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Product name must contain at least 2 characters.")
        .max(150),
    shortDescription: zod_1.z
        .string()
        .trim()
        .max(300)
        .default(""),
    description: zod_1.z
        .string()
        .trim()
        .max(10_000)
        .default(""),
    brand: zod_1.z
        .string()
        .trim()
        .max(100)
        .default(""),
    categoryId: objectIdSchema,
    images: zod_1.z
        .array(productImageSchema)
        .max(10, "A product cannot have more than 10 images.")
        .default([]),
    variants: zod_1.z
        .array(productVariantSchema)
        .min(1, "A product requires at least one variant.")
        .max(100, "A product cannot have more than 100 variants."),
})
    .superRefine((product, context) => {
    const skus = product.variants.map((variant) => variant.sku);
    if (new Set(skus).size !== skus.length) {
        context.addIssue({
            code: "custom",
            path: ["variants"],
            message: "Two variants in the same product cannot use the same SKU.",
        });
    }
});
exports.adminProductListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce
        .number()
        .int()
        .min(1)
        .default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),
    status: zod_1.z
        .enum(["draft", "active", "archived"])
        .optional(),
    categoryId: objectIdSchema.optional(),
    search: zod_1.z
        .string()
        .trim()
        .max(100)
        .optional(),
    sort: zod_1.z
        .enum([
        "newest",
        "oldest",
        "name-asc",
        "name-desc",
    ])
        .default("newest"),
});
