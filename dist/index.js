"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const product_1 = __importDefault(require("./product"));
const multer_1 = __importDefault(require("multer"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const PORT = 3000;
mongoose_1.default.connect('mongodb://0.0.0.0:27017/apiTest')
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));
app.use(body_parser_1.default.json());
// Configure multer for file upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
// Function to call /products route internally
const callProductsRoute = (products) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post(`http://localhost:${PORT}/products`, products);
        return response.data;
    }
    catch (error) {
        throw new Error('Error calling /products route');
    }
});
// Transform function
function transformPayload(input) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('3rd', JSON.stringify(input));
        const toArray = (str, delimiter = ';') => {
            if (!str)
                return [];
            return str.includes(delimiter) ? str.split(delimiter) : [str];
        };
        const parseFeature = (feature) => {
            const labels = toArray(feature.label);
            const values = toArray(feature.value);
            return labels.map((label, index) => ({
                label,
                value: values[index] || '',
            }));
        };
        //parse review
        const parseReviews = (reviews) => {
            const userNames = toArray(reviews.userName);
            const reviewTexts = toArray(reviews.review);
            const review = userNames.map((userName, index) => ({
                userName,
                review: reviewTexts[index] || ''
            }));
            console.log("rv", review);
            return review;
        };
        return {
            index: input.index === 'true',
            brandName: input.brandName,
            productName: input.productName,
            categoryId: input.categoryId,
            slug: input.slug,
            regularPrice: input.regularPrice,
            salePrice: input.salePrice,
            description: input.description,
            url: input.url,
            images: toArray(input.images),
            status: parseInt(input.status, 10),
            subCategory: input.subCategory,
            metaInfo: {
                metaInfoTitle: input.metaInfoTitle,
                metaInfoDescription: input.metaInfoDescription,
                metaInfoKeyword: toArray(input.metaInfoKeyword),
                metaInfoKeyFeature: toArray(input.metaInfoKeyFeature),
            },
            totalStock: input.totalStock,
            weight: input.weight,
            gst: input.gst,
            sku_ID: input.sku_ID,
            dimension: input.dimension,
            specification: [
                {
                    heading: input.specification["heading"],
                    feature: parseFeature(input.specification.feature),
                },
            ],
            variation: [
                {
                    variationName: input.variation.variationName,
                    variationValue: toArray(input.variation.variationValue),
                },
            ],
            reviews: input.reviews ? parseReviews(input.reviews) : [],
        };
    });
}
let productJson = [];
app.post('/upload', upload.single('csvfile'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const filePath = path_1.default.join('./src/uploads', req.file.filename);
    try {
        console.log('FilePath', filePath);
        productJson = (yield (0, csvtojson_1.default)().fromFile(filePath));
        console.log('conversion complete', productJson);
        // Delete the uploaded file after processing
        fs_1.default.unlinkSync(filePath);
        // Loop for bulk data transform and then entry.
        for (const data of productJson) {
            try {
                transformPayload(data).then((transformedData) => {
                    console.log("2nd", transformedData);
                    const savedProducts = callProductsRoute(transformedData);
                });
            }
            catch (error) {
                res.status(500).send('Error while processing the file, Check CSV file');
            }
        }
        res.status(200).json({ success: true, message: 'Data added successfully' });
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Error processing the file.');
    }
}));
// POST route to save a product
app.post('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('inside', req.body);
    try {
        const product = new product_1.default(req.body);
        yield product.save();
        res.status(201).send({ success: true, message: 'Data added successfully' });
    }
    catch (error) {
        res.status(400).send({ success: false, message: 'Error while bulk Data', error });
    }
}));
app.get('/test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(201).send({ success: true, message: 'backend Started' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error in starting', error });
    }
}));
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
