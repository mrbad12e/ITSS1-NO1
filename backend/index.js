import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import routes from './routes/index';
import { corsOptions } from './middleware/cors';
import SocketService from './services/socket.service';

// SSL configuration
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, '../certificates/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certificates/cert.pem'))
};

const app = express();
// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors(corsOptions));

const server = http.createServer(sslOptions, app);
const socketService = new SocketService(server);

// Routes
app.use('/', routes);


// Database connection and server start
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected');
        server.listen(process.env.PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => console.log('MongoDB connect error: ', error.message));

export default app;
