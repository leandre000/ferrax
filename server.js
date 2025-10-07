import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import http from 'http'
import { connectDB } from './config/db.js'
import { logger } from './config/logger.js'
import pinoHttp from 'pino-http'
import authRoutes from './routes/auth.routes.js'
import carRoutes from './routes/car.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import orderRoutes from './routes/order.routes.js'
import messageRoutes from './routes/message.routes.js'
import webhookRoutes from './routes/webhook.routes.js'
import userRoutes from './routes/user.routes.js'
import { auditLogger } from './middlewares/audit.middleware.js'
import { initializeSocket } from './services/socket.service.js'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import wishlistRouter from './routes/wishlist.routes.js'

dotenv.config()

const app = express()
const server = http.createServer(app)

// Request logging with request id
app.use(pinoHttp({
  logger,
  genReqId: (req, res) => req.headers['x-request-id'] || undefined,
  serializers: {
    req(req) { return { id: req.id, method: req.method, url: req.url } },
    res(res) { return { statusCode: res.statusCode } }
  }
}))

app.use('/api/webhooks', webhookRoutes)

// Middleware
app.use(express.json())
app.use(cookieParser())

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true) // allow non-browser clients
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Auth-Token', 'X-Request-ID'],
  exposedHeaders: ['Content-Range', 'X-Total-Count']
}

app.use(cors(corsOptions))

// Audit logging
app.use(auditLogger)

// Routes
// Swagger docs
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CarHubConnect API',
      version: '1.0.0',
      description: 'A comprehensive car sales management system API with authentication, booking, ordering, and messaging capabilities.',
      contact: {
        name: 'CarHubConnect Support',
        email: 'support@carhubconnect.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: process.env.PRODUCTION_API_URL || 'https://carhubconnect.onrender.com',
        description: 'Production server'
      }
    ],
    security: [
      {
        cookieAuth: []
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in httpOnly cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullname: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Car: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            make: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'number' },
            price: { type: 'number' },
            status: { type: 'string', enum: ['available', 'reserved', 'sold', 'rented'] },
            mileage: { type: 'number' },
            description: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            primaryImage: { type: 'string' },
            location: { type: 'string' },
            fuelType: { type: 'string', enum: ['petrol', 'diesel', 'electric', 'hybrid', 'other'] },
            transmission: { type: 'string', enum: ['automatic', 'manual'] },
            bodyType: { type: 'string' },
            color: { type: 'string' },
            owner: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            car: { type: 'string' },
            user: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'expired'] },
            notes: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            car: { type: 'string' },
            buyer: { type: 'string' },
            amount: { type: 'number' },
            status: { type: 'string', enum: ['initiated', 'paid', 'cancelled'] },
            notes: { type: 'string' },
            paymentRef: { type: 'string' },
            stripeSessionId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            sender: { type: 'string' },
            recipient: { type: 'string' },
            car: { type: 'string' },
            content: { type: 'string' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
            status: { type: 'number' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js', './models/*.js']
})
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CarHubConnect API Documentation'
}))

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/wishlist', wishlistRouter);

// Initialize WebSocket
const socketService = initializeSocket(server)

// Make socket.io instance available to routes
app.set('io', socketService.getIO())

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API server
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/health', (req, res) => { res.json({ status: 'ok' }) })

const PORT = process.env.PORT || 5000

// Global error handler (must be after all routes)
app.use((err, req, res, next) => {
  const status = err.status || 500
  const code = err.code || 'INTERNAL_ERROR'
  logger.error({ err, status, code, path: req.originalUrl }, err.message || 'Unhandled error')
  res.status(status).json({ message: err.message || 'Internal server error' })
})

connectDB()
  .then(() => {
    server.listen(PORT, () => logger.info({ port: PORT }, 'Server started with WebSocket support'))
  })
  .catch((e) => {
    logger.error({ err: e }, 'Failed to start server')
  })
