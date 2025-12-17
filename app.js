// app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
// import path from 'path';
// import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './Middlewares/errorMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import officeRoutes from './routes/officeRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import newsRoutes from './routes/newsRoutes.js';


// ES6 module fix for __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Connect database
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://imadel.netlify.app" // deployed frontend
    ],
    credentials: true, // if your API uses cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Create uploads folder if it doesn't exist
// import fs from 'fs';
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// Serve static uploads
// app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/news', newsRoutes);


// Health check
app.get('/', (req, res) => res.json({ message: 'IMADEL API is running' }));

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
}); 

export default app;