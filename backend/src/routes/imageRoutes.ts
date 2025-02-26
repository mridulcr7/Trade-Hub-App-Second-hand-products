import { Router } from "express";
import multer from "multer";
import { addProductWithImage } from "../controllers/imageController";
import { upload } from "../config/multerConfig";

const router = Router();

// Configure multer storage
// const storage = multer.memoryStorage(); // Stores the file in memory as a buffer
// const upload = multer({ storage });

router.post("/upload", upload.single("image"), addProductWithImage);
//console.log("image1");

export default router;
