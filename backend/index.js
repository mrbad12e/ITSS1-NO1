import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import cookieParser from 'cookie-parser';

import routes from './routes/index';
import { corsOptions } from './middleware/cors';
import SocketService from './services/socket.service';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors(corsOptions));
const socketService = new SocketService(server);

// Routes
app.use('/api', routes);

// Database connection and server start
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected');
        server.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => console.log('MongoDB connect error: ', error.message));

export default app;