import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: 'Not authenticated' })

    const secret = process.env.JWT_SECRET
    if (!secret) return res.status(500).json({ message: 'Server configuration error' })
    
    const decoded = jwt.verify(token, secret)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ message: 'User not found' })
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin' || !req.user) return res.status(403).json({ message: 'Admin only' })
  next()
}


