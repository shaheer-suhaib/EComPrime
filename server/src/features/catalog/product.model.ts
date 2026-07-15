import {
  model,
  Schema,
  type InferSchemaType,
} from "mongoose";

const productImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    altText: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },
    sortOrder: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const variantAttributeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const   productVariantSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  attributes: {
    type: [variantAttributeSchema],
    default: [],
  },
  priceMinor: {
    type: Number,
    required: true,
    min: 0,
  },
  compareAtPriceMinor: {
    type: Number,
    min: 0,
    default: null,
  },
  currency: {
    type: String,
    enum: ["PKR"],
    default: "PKR",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 10_000,
      default: "",
    },
    brand: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
      index: true,
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
    variants: {
      type: [productVariantSchema],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ "variants.sku": 1 }, { unique: true });
productSchema.index({ status: 1, categoryId: 1, createdAt: -1 });

export type ProductDocument =
  InferSchemaType<typeof productSchema>;

export const Product = model("Product", productSchema);