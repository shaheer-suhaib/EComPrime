"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const admin_catalog_route_1 = require("../../features/catalog/admin-catalog.route");
const envelope_1 = require("../../utils/envelope");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.use(auth_1.requireAuth, auth_1.requireAdmin);
exports.adminRouter.get("/access-check", (_req, res) => {
    res.status(200).json((0, envelope_1.ok)({
        message: "Admin access verified.",
    }));
});
exports.adminRouter.use("/catalog", admin_catalog_route_1.adminCatalogRouter);
