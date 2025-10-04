import User from '../models/user.model.js'
import { logger } from '../config/logger.js'

export const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query
    const filter = {}
    if (q) {
      filter.$or = [
        { fullname: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') }
      ]
    }
    const users = await User.find(filter)
      .select('-password -otpCode -otpExpiresAt')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
    const count = await User.countDocuments(filter)
    res.json({ items: users, total: count, page: Number(page), limit: Number(limit) })
  } catch (error) {
    logger.error({ err: error, query: req.query }, 'Failed to fetch users')
    res.status(500).json({ message: 'Failed to fetch users' })
  }
}

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' })
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password -otpCode -otpExpiresAt')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    logger.error({ err: error, targetUserId: req.params.id, role }, 'Failed to update user role')
    res.status(400).json({ message: 'Failed to update user role' })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otpCode -otpExpiresAt')
    res.json(users)
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch users')
    res.status(500).json({ message: 'Failed to fetch users' })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).select('-password -otpCode -otpExpiresAt')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    logger.error({ err: error, targetUserId: req.params.id }, 'Failed to fetch user')
    res.status(500).json({ message: 'Failed to fetch user' })
  }
}

export const getUserByPhone = async (req, res) => {
  try {
    const { phone } = req.params
    const user = await User.findOne({ phone }).select('-password -otpCode -otpExpiresAt')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    logger.error({ err: error, targetUserPhone: req.params.phone }, 'Failed to fetch user')
    res.status(500).json({ message: 'Failed to fetch user' })
  }
}

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id).select('-password -otpCode -otpExpiresAt')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    logger.error({ err: error, targetUserId: req.params.id }, 'Failed to delete user')
    res.status(500).json({ message: 'Failed to delete user' })
  }
}