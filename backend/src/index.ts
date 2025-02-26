import express from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';
import userRoutes from './routes/userRoutes';
import ProductRoutes from './routes/ProductRoutes';
import imageRoutes from './routes/imageRoutes';
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/user', userRoutes);
app.use('/product', ProductRoutes);
app.use('/image', imageRoutes);
app.use(errorHandler as express.ErrorRequestHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
