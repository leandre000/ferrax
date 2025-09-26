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

// Webhooks must be mounted before json parser for raw body
app.use('/api/webhooks', webhookRoutes)

// Middleware
app.use(express.json())
app.use(cookieParser())
const allowedOrigins = (process.env.CLIENT_URLS || '').split(',').map(origin => origin.trim()).filter(origin => origin !== '');
console.log(allowedOrigins)
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.some(allowedOrigin => allowedOrigin === origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS', origin));
    }
  },
  credentials: true
}))

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
