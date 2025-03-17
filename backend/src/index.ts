import express from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';
import userRoutes from './routes/userRoutes';
import ProductRoutes from './routes/ProductRoutes';
import imageRoutes from './routes/imageRoutes';
import chatRoutes from './routes/chatRoutes';
import cors from "cors";
import { createServer } from 'http';
import { Server } from 'socket.io';
import chatEvents from './socket/chatEvents';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/user', userRoutes);
app.use('/product', ProductRoutes);
app.use('/image', imageRoutes);
app.use('/chat', chatRoutes);
app.use(errorHandler as express.ErrorRequestHandler);

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

chatEvents(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
