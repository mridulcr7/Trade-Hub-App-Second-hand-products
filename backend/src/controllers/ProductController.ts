import { Request, Response } from 'express';
import { createProduct, getAllProducts, getProductById, getUserProductsService, updateProductService } from '../services/ProductService';
import { CreateProductDTO } from '../models/CreateProductDTO';
import { getRandomProducts } from '../repositories/ProductRepository';

export const addProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const dto: CreateProductDTO = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const product = await createProduct(dto, userId);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error });
  }
};

export const getAllProductsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, lat, long, userId, page = 1, limit = 3, random = false } = req.body; // Default random = false

    // console.log("Fetching products...");
    // console.log(userId)
    console.log(req.body)

    // If random is true, fetch random products
    if (random) {
      const products = await getRandomProducts(Number(page), Number(limit), userId);

      res.status(200).json(products);
      return;
    }

    // If random is not true, fetch based on filters
    if (!lat || !long || !category) {
      res.status(400).json({ message: "Latitude, longitude, and category are required" });
      return;
    }

    const products = await getAllProducts(lat, long, category, userId, Number(page), Number(limit));
    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getAllProductsController:", error);
    res.status(500).json({ message: "An error occurred while fetching products", error });
  }
};



export const getProductByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    const product = await getProductById(id);

    // console.log(product);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error in getProductByIdController:", error);
    res.status(500).json({ message: "An error occurred while fetching the product", error });
  }
};

export const getUserProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    //console.log(userId);

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const products = await getUserProductsService(userId);
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching user products:", error);
    res.status(500).json({ message: "Failed to retrieve products", error });
  }
};

// Handle product updates


export const updateProductController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, price, status, image, latitude, longitude, verification_status, description } = req.body;

    if (!id) {
      res.status(400).json({ message: "Product ID is required" });
    }

    const updatedFields: any = {};

    if (price !== undefined) updatedFields.price = price;
    if (status !== undefined) updatedFields.status = status;
    if (image !== undefined) updatedFields.image = image;
    if (latitude !== undefined) updatedFields.latitude = latitude;
    if (longitude !== undefined) updatedFields.longitude = longitude;
    if (description !== undefined) updatedFields.description = description;
    if (verification_status !== undefined) updatedFields.verification_status = verification_status;

    if (Object.keys(updatedFields).length === 0) {
      res.status(400).json({ message: "No fields provided for update" });
    }

    const updatedProduct = await updateProductService(id, updatedFields);

    res.status(200).json({ success: true, updatedProduct });
  } catch (error: any) {
    console.error("Controller Error:", error.message || error);
    res.status(400).json({ success: false, message: error.message || "Error updating product" });
  }
};
