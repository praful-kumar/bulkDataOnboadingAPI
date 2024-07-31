"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    index: { type: Boolean, required: true, default: true },
    brandName: { type: String, required: true },
    productName: { type: String, required: true },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: true,
    },
    slug: { type: String, required: true },
    regularPrice: { type: String, required: true },
    salePrice: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    images: { type: [String], required: true },
    status: { type: Number, required: true, default: 1 },
    subCategory: { type: String, required: true },
    metaInfo: {
        metaInfoTitle: { type: String, required: true },
        metaInfoDescription: { type: String, required: true },
        metaInfoKeyword: { type: [String], required: true },
        metaInfoKeyFeature: { type: [String], required: true },
    },
    totalStock: { type: String, required: true, default: "0" },
    weight: { type: String, required: true, default: "0" },
    gst: { type: String, required: true, default: "0" },
    sku_ID: { type: String, required: true, default: "" },
    dimension: { type: String, required: true, default: "" },
    specification: [
        {
            heading: { type: String, required: true, default: "" },
            feature: [
                {
                    label: { type: String, required: true, default: "" },
                    value: { type: String, required: true, default: "" },
                },
            ],
        },
    ],
    variation: [
        {
            variationName: { type: String, required: true, default: "" },
            variationValue: { type: [String], required: true, default: [] },
        },
    ],
    reviews: [
        {
            userName: { type: String, required: false },
            review: { type: String, required: false },
        },
    ],
});
const Product = (0, mongoose_1.model)('Product', ProductSchema);
exports.default = Product;
