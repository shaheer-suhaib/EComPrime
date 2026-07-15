"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = createCategory;
exports.listAdminCategories = listAdminCategories;
exports.createProduct = createProduct;
exports.listAdminProducts = listAdminProducts;
const AppError_1 = require("../../utils/AppError");
const createSlug_1 = require("../../utils/createSlug");
const category_model_1 = require("./category.model");
const product_model_1 = require("./product.model");
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function isDuplicateKeyError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000);
}
async function createCategory(input, adminUserId) {
    const slug = (0, createSlug_1.createSlug)(input.name);
    if (!slug) {
        throw new AppError_1.AppError(400, "Category name cannot generate a valid URL slug.");
    }
    const escapedName = escapeRegex(input.name);
    const existingCategory = await category_model_1.Category.exists({
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
        throw new AppError_1.AppError(409, "A category with this name already exists.");
    }
    try {
        return await category_model_1.Category.create({
            ...input,
            slug,
            createdBy: adminUserId,
            updatedBy: adminUserId,
        });
    }
    catch (error) {
        if (isDuplicateKeyError(error)) {
            throw new AppError_1.AppError(409, "A category with this name or slug already exists.");
        }
        throw error;
    }
}
async function listAdminCategories() {
    return category_model_1.Category.find()
        .sort({ name: 1 })
        .lean();
}
async function generateUniqueProductSlug(name) {
    const baseSlug = (0, createSlug_1.createSlug)(name);
    if (!baseSlug) {
        throw new AppError_1.AppError(400, "Product name cannot generate a valid URL slug.");
    }
    let slug = baseSlug;
    let suffix = 2;
    while (await product_model_1.Product.exists({ slug })) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
        if (suffix > 100) {
            throw new AppError_1.AppError(409, "Unable to generate a unique product slug.");
        }
    }
    return slug;
}
async function createProduct(input, adminUserId) {
    const categoryExists = await category_model_1.Category.exists({
        _id: input.categoryId,
    });
    if (!categoryExists) {
        throw new AppError_1.AppError(400, "The selected category does not exist.");
    }
    const requestedSkus = input.variants.map((variant) => variant.sku);
    const existingSku = await product_model_1.Product.exists({
        "variants.sku": {
            $in: requestedSkus,
        },
    });
    if (existingSku) {
        throw new AppError_1.AppError(409, "One or more SKUs are already used by another product.");
    }
    const slug = await generateUniqueProductSlug(input.name);
    try {
        return await product_model_1.Product.create({
            ...input,
            slug,
            status: "draft",
            createdBy: adminUserId,
            updatedBy: adminUserId,
        });
    }
    catch (error) {
        if (isDuplicateKeyError(error)) {
            throw new AppError_1.AppError(409, "The product slug or one of its SKUs already exists.");
        }
        throw error;
    }
}
// listing service
async function listAdminProducts(query) {
    const filter = {};
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
    const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        "name-asc": { name: 1 },
        "name-desc": { name: -1 },
    };
    const skip = (query.page - 1) * query.limit;
    const [documents, total] = await Promise.all([
        product_model_1.Product.find(filter)
            .select([
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
        ].join(" "))
            .populate("categoryId", "name slug status")
            .sort(sortOptions[query.sort])
            .skip(skip)
            .limit(query.limit)
            .lean(),
        product_model_1.Product.countDocuments(filter),
    ]);
    const products = documents.map((product) => {
        const activePrices = product.variants
            .filter((variant) => variant.priceMinor != null)
            .map((variant) => variant.priceMinor);
        const minPriceMinor = activePrices.length > 0
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
