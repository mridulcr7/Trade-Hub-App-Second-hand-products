import { Router } from 'express';
import { createUserController, getUserProfile, LoginUserController, updateUserProfile } from '../controllers/userController';
import asyncWrapper from '../middleware/asyncWrapper';
import { upload } from "../config/multerConfig";

const router = Router();

//authentication route
router.post('/register', upload.single("image"), asyncWrapper(createUserController));
router.post('/login', asyncWrapper(LoginUserController));

//profile route
router.post('/profile', asyncWrapper(getUserProfile));
router.put('/profile', upload.single("image"), asyncWrapper(updateUserProfile));

export default router;
