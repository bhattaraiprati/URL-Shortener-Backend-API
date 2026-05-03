import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import urlRoutes from './routes/urlRoutes';
import sequelize from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', true);

app.use(cors({
  origin: 'http://localhost:3000', // Update this for production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// API Routes
app.use('/api', urlRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'URL Shortener Backend (TypeScript) is running' });
});

let server: any;

// Sync Database and Start Server
const startServer = async () => {
  try {
    await sequelize.sync({ alter: true }); // Use alter: true to update schema without dropping data
    console.log('Database synchronized');
    
    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};


startServer();


// Graceful Shutdown
const shutdown = () => {
  console.log('\nShutting down server gracefully...');
  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });

  // Force exit after 5 seconds if not closed
  setTimeout(() => {
    console.error('Could not close server in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', shutdown);   
process.on('SIGTERM', shutdown); 


