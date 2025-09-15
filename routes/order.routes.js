import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { createOrder, payOrder, listMyOrders, createCheckoutSession, getOrderById } from '../controllers/order.controllers.js'

const router = express.Router()

router.post('/', protect, createOrder)
router.post('/checkout', protect, createCheckoutSession)
router.post('/:id/pay', protect, payOrder)
router.get('/:id', protect, getOrderById)
router.get('/me', protect, listMyOrders)

export default router

