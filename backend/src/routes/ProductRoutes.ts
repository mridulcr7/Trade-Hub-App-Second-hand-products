import express from 'express';
import { addProduct } from '../controllers/ProductController';
import { authenticateUser } from '../middleware/authMiddleware';
import { getAllProductsController } from '../controllers/ProductController';
import { getProductByIdController } from '../controllers/ProductController';
import { getUserProducts } from '../controllers/ProductController';
import { updateProductController } from '../controllers/ProductController';

const router = express.Router();

router.post('/add-products', authenticateUser, addProduct);
router.post('/get-products', getAllProductsController);
router.get("/:id", getProductByIdController);
router.post("/user", getUserProducts)
router.put("/update", updateProductController)

export default router;
