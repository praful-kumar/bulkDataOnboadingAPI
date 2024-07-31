import { Schema, model, Document } from 'mongoose';

interface IProduct extends Document {
  index: boolean;
  brandName: string;
  productName: string;
  categoryId: Schema.Types.ObjectId;
  slug: string;
  regularPrice: string;
  salePrice: string;
  description: string;
  url: string;
  images: string[];
  status: number;
  subCategory: string;
  metaInfo: {
    metaInfoTitle: string;
    metaInfoDescription: string;
    metaInfoKeyword: string[];
    metaInfoKeyFeature: string[];
  };
  totalStock: string;
  weight: string;
  gst: string;
  sku_ID: string;
  dimension: string;
  specification: {
    heading: string;
    feature: {
      label: string;
      value: string;
    }[];
  }[];
  variation: {
    variationName: string;
    variationValue: string[];
  }[];
  reviews: {
    userName: string;
    review: string[];
  }[];
}

const ProductSchema = new Schema({
  index: { type: Boolean, required: true, default: true },
  brandName: { type: String, required: true },
  productName: { type: String, required: true },
  categoryId: {
    type: Schema.Types.ObjectId,
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

const Product = model<IProduct>('Product', ProductSchema);
export default Product;
