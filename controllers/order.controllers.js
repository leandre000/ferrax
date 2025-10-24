import Order from '../models/order.model.js'
import Car from '../models/car.model.js'
import { logger } from '../config/logger.js'

export const createOrder = async (req, res) => {
  try {
    const { carId, amount, notes } = req.body
    const car = await Car.findById(carId)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    if (car.status === 'sold') return res.status(400).json({ message: 'Car already sold' })
    if (car.status === 'reserved' && car.reservedBy?.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Car reserved by another user' })
    }
    const order = await Order.create({ car: car._id, buyer: req.user._id, amount, notes })
    logger.info({ orderId: order._id, carId: car._id, userId: req.user._id }, 'Order created')
    res.status(201).json(order)
  } catch (error) {
    logger.error({ err: error, userId: req.user?._id, carId }, 'Failed to create order')
    res.status(400).json({ message: 'Failed to create order' })
  }
}

export const listMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).populate('car')
    res.json(orders)
  } catch (error) {
    logger.error({ err: error, userId: req.user?._id }, 'Failed to fetch my orders')
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
}

export const listAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const filter = {}
    if (status) filter.status = status
    const items = await Order.find(filter).populate('car buyer', 'make model year fullname email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
    const total = await Order.countDocuments(filter)
    res.json({ items, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    logger.error({ err: error, query: req.query }, 'Failed to fetch orders (admin)')
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
}

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    const isBuyer = order.buyer.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isBuyer && !isAdmin) return res.status(403).json({ message: 'Forbidden' })
    if (order.status !== 'initiated') return res.status(400).json({ message: 'Cannot cancel this order' })
    order.status = 'cancelled'
    await order.save()
    logger.info({ orderId: order._id, userId: req.user._id }, 'Order cancelled')
    res.json(order)
  } catch (error) {
    logger.error({ err: error, orderId: req.params.id, userId: req.user?._id }, 'Failed to cancel order')
    res.status(400).json({ message: 'Failed to cancel order' })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('car')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    const isBuyer = order.buyer.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isBuyer && !isAdmin) return res.status(403).json({ message: 'Forbidden' })
    res.json(order)
  } catch (error) {
    logger.error({ err: error, orderId: req.params.id, userId: req.user?._id }, 'Failed to fetch order by id')
    res.status(404).json({ message: 'Order not found' })
  }
}


