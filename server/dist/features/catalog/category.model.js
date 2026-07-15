"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
        index: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
// createdBy and updatedBy  basic accountability. Later, proper audit logs can record exactly what changed.
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ status: 1, name: 1 });
exports.Category = (0, mongoose_1.model)("Category", categorySchema);
