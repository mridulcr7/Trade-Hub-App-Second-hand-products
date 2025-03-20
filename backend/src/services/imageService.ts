import { Express } from "express";
import { Pool } from 'pg';

interface CloudinaryResponse {
    secure_url: string;
    [key: string]: any;
}


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, // Ensure this is a string
    port: Number(process.env.DB_PORT),
    ssl: {
        rejectUnauthorized: false,
    },
});






export const uploadImageService = async (file: Express.Multer.File): Promise<string> => {
    try {
        console.log("2");
        console.log(file.buffer);

        //Base64 encoding transforms binary data into an ASCII string format, 
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        //console.log(base64Image);

        const data = new FormData();
        data.append("file", base64Image);
        data.append("upload_preset", "samridhi_images");
        data.append("cloud_name", "dr2hkajom");

        const response = await fetch("https://api.cloudinary.com/v1_1/dr2hkajom/image/upload", {
            method: "POST",
            body: data as any,
        });

        if (!response.ok) {
            throw new Error("Failed to upload image");
        }

        const result = (await response.json()) as CloudinaryResponse;

        // console.log("Success:", result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload image to Cloudinary");
    }
};


export const uploadUserImageService = async (file: Express.Multer.File): Promise<string> => {
    try {
        console.log("2");
        console.log(file.buffer);
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        //console.log(base64Image);

        const data = new FormData();
        data.append("file", base64Image);
        data.append("upload_preset", "samridhi_images");
        data.append("cloud_name", "dr2hkajom");

        const response = await fetch("https://api.cloudinary.com/v1_1/dr2hkajom/image/upload", {
            method: "POST",
            body: data as any,
        });

        if (!response.ok) {
            throw new Error("Failed to upload image");
        }

        const result = (await response.json()) as CloudinaryResponse;

        console.log("Success:", result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload image to Cloudinary");
    }
};


export const saveImageToDatabase = async (productid: string, imageUrl: string): Promise<void> => {
    try {
        const query = `
      INSERT INTO images (product_id, url)
      VALUES ($1, $2)
    `;
        await pool.query(query, [productid, imageUrl]);
        console.log("Image saved to the database successfully");
    } catch (error) {
        console.error("Error saving image to the database:", error);
        throw error;
    }
}