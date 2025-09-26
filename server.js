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

// CORS configuration - allow all origins
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Auth-Token'],
  exposedHeaders: ['Content-Range', 'X-Total-Count']
}

app.use(cors(corsOptions))

// Handle preflight requests
app.options('*', cors(corsOptions))

// Audit logging
app.use(auditLogger)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/cars', carRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)

// Initialize WebSocket
initializeSocket(server)

// Health check
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
