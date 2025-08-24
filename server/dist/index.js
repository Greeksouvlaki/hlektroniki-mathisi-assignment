import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Import routes
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quizzes.js';
import moduleRoutes from './routes/modules.js';
import progressRoutes from './routes/progress.js';
import adaptiveRoutes from './routes/adaptive.js';
// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
const app = express();
const PORT = process.env['PORT'] || 3000;
const NODE_ENV = process.env['NODE_ENV'] || 'development';
// Database connection
const connectDB = async () => {
    try {
        const mongoURI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/adaptive_elearning';
        await mongoose.connect(mongoURI);
        logger.info('MongoDB connected successfully');
    }
    catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Adaptive E-Learning API',
            version: '1.0.0',
            description: 'API documentation for the Adaptive E-Learning Platform',
            contact: {
                name: 'API Support',
                email: 'support@adaptive-elearning.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt((process.env['RATE_LIMIT_WINDOW_MS'] || '900000')), // 15 minutes
    max: parseInt((process.env['RATE_LIMIT_MAX_REQUESTS'] || '1000')), // limit each IP to 1000 requests per windowMs in development
    message: {
        error: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false
});
// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(compression());
app.use(cors({
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Logging
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
else {
    app.use(morgan('combined'));
}
// Apply rate limiting to all routes
app.use(limiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: '1.0.0'
    });
});
// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
// API routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/adaptive', adaptiveRoutes);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        timestamp: new Date().toISOString()
    });
});
// Error handling middleware
app.use(errorHandler);
// Start server
const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
            logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
        });
        // Graceful shutdown
        const gracefulShutdown = (signal) => {
            logger.info(`Received ${signal}. Starting graceful shutdown...`);
            server.close(() => {
                logger.info('HTTP server closed');
                mongoose.connection.close(false);
                logger.info('MongoDB connection closed');
                process.exit(0);
            });
        };
        // Handle graceful shutdown
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error('Unhandled Promise Rejection:', err);
            gracefulShutdown('unhandledRejection');
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            logger.error('Uncaught Exception:', err);
            gracefulShutdown('uncaughtException');
        });
    }
    catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Start the server
startServer();
//# sourceMappingURL=index.js.map