import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { logger } from './config/logger.js'
import pinoHttp from 'pino-http'
import authRoutes from './routes/auth.routes.js'
import carRoutes from './routes/car.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import orderRoutes from './routes/order.routes.js'
import webhookRoutes from './routes/webhook.routes.js'
import userRoutes from './routes/user.routes.js'
import { auditLogger } from './middlewares/audit.middleware.js'

dotenv.config()

const app = express()

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
app.use(cors({
  origin: process.env.CLIENT_URL || "https://carhub-rw.vercel.app",
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
    app.listen(PORT, () => logger.info({ port: PORT }, 'Server started'))
  })
  .catch((e) => {
    logger.error({ err: e }, 'Failed to start server')
  })
