import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import carRoutes from './routes/car.routes.js'

dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/cars', carRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
