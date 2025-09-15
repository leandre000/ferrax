import Order from '../models/order.model.js'
import Car from '../models/car.model.js'

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
    res.status(201).json(order)
  } catch (error) {
    res.status(400).json({ message: 'Failed to create order' })
  }
}

export const payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('car')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' })
    if (order.status !== 'initiated') return res.status(400).json({ message: 'Invalid order status' })

    const { paymentRef } = req.body
    order.paymentRef = paymentRef || `PAY-${Date.now()}`
    order.status = 'paid'
    await order.save()

    const car = await Car.findById(order.car)
    car.status = 'sold'
    car.reservedBy = undefined
    car.reservedUntil = undefined
    await car.save()

    res.json(order)
  } catch (error) {
    res.status(400).json({ message: 'Failed to complete payment' })
  }
}

export const listMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).populate('car')
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
}


