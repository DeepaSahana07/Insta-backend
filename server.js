import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import freeApiService from './services/freeApiService.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://insta-frontend-rouge-five.vercel.app', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Handle preflight requests
app.options('*', cors());

// Routes
app.use('/api/user-auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Demo data routes using free APIs
app.get('/api/demo/posts', async (req, res) => {
  try {
    const posts = await freeApiService.getDemoPosts(20);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching demo posts' });
  }
});

app.get('/api/demo/users', async (req, res) => {
  try {
    const users = await freeApiService.getDemoUsers(15);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching demo users' });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Instagram Clone API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});