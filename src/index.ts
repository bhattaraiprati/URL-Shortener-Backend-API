import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import urlRoutes from './routes/urlRoutes';
import sequelize from './config/db';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const app = express();
const PORT = 5000;

app.set('trust proxy', true);

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'URL Shortener API',
      version: '1.0.0',
      description: 'API documentation for the URL Shortener project',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/index.ts'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api', urlRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'URL Shortener Backend (TypeScript) is running' });
});

let server: any;

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
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

const shutdown = () => {
  console.log('\nShutting down server gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed successfully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  setTimeout(() => {
    console.error('Could not close server in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', shutdown);   
process.on('SIGTERM', shutdown); 
