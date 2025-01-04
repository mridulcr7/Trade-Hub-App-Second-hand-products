import { Router } from 'express';
import { createUserController } from '../controllers/userController';
import asyncWrapper from '../middleware/asyncWrapper';

const router = Router();

router.post('/users', asyncWrapper(createUserController));

export default router;
