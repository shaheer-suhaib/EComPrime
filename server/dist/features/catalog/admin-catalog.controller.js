"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryController = createCategoryController;
exports.listCategoriesController = listCategoriesController;
exports.createProductController = createProductController;
const AppError_1 = require("../../utils/AppError");
const envelope_1 = require("../../utils/envelope");
const catalog_service_1 = require("./catalog.service");
async function createCategoryController(req, res) {
    const adminUser = res.locals.dbUser;
    if (!adminUser) {
        throw new AppError_1.AppError(500, "Authenticated admin context is missing.");
    }
    const category = await (0, catalog_service_1.createCategory)(req.body, adminUser._id);
    res.status(201).json((0, envelope_1.ok)({
        category,
    }));
}
async function listCategoriesController(_req, res) {
    const categories = await (0, catalog_service_1.listAdminCategories)();
    res.status(200).json((0, envelope_1.ok)({
        categories,
    }));
}
async function createProductController(req, res) {
    const adminUser = res.locals.dbUser;
    if (!adminUser) {
        throw new AppError_1.AppError(500, "Authenticated admin context is missing.");
    }
    const product = await (0, catalog_service_1.createProduct)(req.body, adminUser._id);
    res.status(201).json((0, envelope_1.ok)({
        product,
    }));
}
