import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { createOrder, payOrder, listMyOrders } from '../controllers/order.controllers.js'

const router = express.Router()

router.post('/', protect, createOrder)
router.post('/:id/pay', protect, payOrder)
router.get('/me', protect, listMyOrders)

export default router

