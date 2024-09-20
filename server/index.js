// server/app.js or server/index.js

import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './mongodb/connect.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';
import imageEditRoutes from './routes/imageEditRoutes.js'; // Import the new route

dotenv.config();

const app = express();

// Configure CORS
app.use(cors({
  origin: 'https://image-gen-frontend-topaz.vercel.app', // Adjust as needed
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// To handle preflight requests
app.options('*', cors({
  origin: 'https://image-gen-frontend-topaz.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware to parse JSON with increased size limit
app.use(express.json({ limit: '50mb' }));

// Mount Routes
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);
app.use('/api/v1/image-edit', imageEditRoutes); // Mount the image edit route

// Root Endpoint
app.get('/', async (req, res) => {
  res.status(200).json({
    message: 'Hello from DALL.E!',
  });
});

// Start Server
const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    app.listen(8080, () => console.log('Server started on port 8080'));
  } catch (error) {
    console.log(error);
  }
};

startServer();
