import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import Product from './product';
import multer from 'multer';
import csv from 'csvtojson';
import path from 'path';
import fs from 'fs';
import axios from 'axios';


const app = express();
const PORT = 3000;


type SpecificationFeature = {
  label: string;
  value: string;
};

type Specification = {
  heading: string;
  feature: SpecificationFeature[];
};

type Variation = {
  variationName: string;
  variationValue: string[];
};

type MetaInfo = {
  metaInfoTitle: string;
  metaInfoDescription: string;
  metaInfoKeyword: string[];
  metaInfoKeyFeature: string[];
};

type Review = {
  userName: string;
  review: string;
};

type ProductPayload = {
  index: boolean;
  brandName: string;
  productName: string;
  categoryId: string;
  slug: string;
  regularPrice: string;
  salePrice: string;
  description: string;
  url: string;
  images: string[];
  status: number;
  subCategory: string;
  metaInfo: MetaInfo;
  totalStock: string;
  weight: string;
  gst: string;
  sku_ID: string;
  dimension: string;
  specification: Specification[];
  variation: Variation[];
  reviews: Review[];
};


mongoose.connect('mongodb://0.0.0.0:27017/apiTest')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));


app.use(bodyParser.json());



// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });


// Function to call /products route internally
const callProductsRoute = async (products: any) => {
  try {
    const response = await axios.post(`http://localhost:${PORT}/products`, products);
    return response.data;
  } catch (error) {
    throw new Error('Error calling /products route');
  }
};



// Transform function
async function transformPayload(input: any): Promise<ProductPayload> {
  console.log('3rd', JSON.stringify(input));
  const toArray = (str: string | undefined, delimiter: string = ';'): string[] => {
    if (!str) return [];
    return str.includes(delimiter) ? str.split(delimiter) : [str];
  };

  const parseFeature = (feature: any): SpecificationFeature[] => {
    const labels = toArray(feature.label);
    const values = toArray(feature.value);
    return labels.map((label, index) => ({
      label,
      value: values[index] || '',
    }));
  };
  //parse review
  const parseReviews = (reviews: any): Review[] => {
    const userNames = toArray(reviews.userName);
    const reviewTexts = toArray(reviews.review);
    const review= userNames.map((userName, index) => ({
      userName,
      review: reviewTexts[index] || ''
    }))
    console.log("rv",review)
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
}

let productJson: any[] = [];
app.post('/upload', upload.single('csvfile'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join('./src/uploads', req.file.filename);

  try {
    console.log('FilePath', filePath)
    productJson = await csv().fromFile(filePath) as ProductPayload[];
    console.log('conversion complete', productJson);

    // Delete the uploaded file after processing
    fs.unlinkSync(filePath);

    // Loop for bulk data transform and then entry.
    for (const data of productJson) {
      try{
        transformPayload(data).then((transformedData) => {
          console.log("2nd", transformedData);
          const savedProducts = callProductsRoute(transformedData);
  
        });
      }catch (error) {
        res.status(500).send('Error while processing the file, Check CSV file');
      }
      
    }


    res.status(200).json({ success: true, message: 'Data added successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error processing the file.');
  }
});

// POST route to save a product
app.post('/products', async (req: Request, res: Response) => {
  console.log('inside', req.body)
 
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).send({ success: true, message: 'Data added successfully' });
  } catch (error) {
    res.status(400).send({ success: false, message: 'Error while bulk Data', error });
  }
});

app.get('/test', async (req: Request, res: Response) => {
  try {
    res.status(201).send({ success: true, message: 'backend Started' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in starting', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

