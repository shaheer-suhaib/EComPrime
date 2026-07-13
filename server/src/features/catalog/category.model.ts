import {
  model,
  Schema,
  type InferSchemaType,
} from "mongoose";

const categorySchema = new Schema(
  {
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

// createdBy and updatedBy  basic accountability. Later, proper audit logs can record exactly what changed.

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ status: 1, name: 1 });

export type CategoryDocument =
  InferSchemaType<typeof categorySchema>;

export const Category = model("Category", categorySchema);