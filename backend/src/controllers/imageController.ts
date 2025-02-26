import { Request, Response } from "express";
import { uploadImageService } from "../services/imageService";
import { createProduct } from "../services/ProductService";
import { CreateProductDTO } from "../models/CreateProductDTO";
import { saveImageToDatabase } from "../services/imageService";

export const addProductWithImage = async (req: Request, res: Response): Promise<void> => {
    try {


        console.log(1);
        console.log(req.body);

        // if (!userId) {
        //     res.status(401).json({ message: "Unauthorized" });
        //     return;
        // }

        if (!req.file) {
            res.status(400).json({ message: "Image is required" });
            return;
        }

        // Step 1: Upload the image and get the URL
        const imageUrl = await uploadImageService(req.file);

        // Step 2: Create the product
        const dto: CreateProductDTO = req.body;
        const userId = dto.userId;
        const product = await createProduct(dto, userId);

        //console.log(product);

        // Step 3: Save the image URL and productId in the images table
        if (product && product.id) {
            await saveImageToDatabase(product.id, imageUrl);
        }

        res.status(201).json({
            message: "Product and image uploaded successfully",
            product,
            imageUrl,
        });
    } catch (error) {
        console.error("Error adding product with image:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};
