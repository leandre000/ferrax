import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { createOrder, listMyOrders, getOrderById, listAllOrders, cancelOrder } from '../controllers/order.controllers.js'
import { requireAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create a new order for a car
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carId, amount]
 *             properties:
 *               carId:
 *                 type: string
 *               amount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Car already sold or reserved by another user
 *       404:
 *         description: Car not found
 */
router.post('/', protect, createOrder)

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       403:
 *         description: Forbidden - not the order buyer or admin
 *       404:
 *         description: Order not found
 */
router.get('/:id', protect, getOrderById)

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Get all orders (admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [initiated, paid, cancelled]
 *     responses:
 *       200:
 *         description: Paginated list of all orders
 *       403:
 *         description: Admin access required
 */
router.get('/', protect, requireAdmin, listAllOrders)

/**
 * @openapi
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Cancel an order
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Cannot cancel this order
 *       403:
 *         description: Forbidden - not the order buyer or admin
 *       404:
 *         description: Order not found
 */
router.post('/:id/cancel', protect, cancelOrder)

/**
 * @openapi
 * /api/orders/me:
 *   get:
 *     summary: Get current user's orders
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 */
router.get('/me', protect, listMyOrders)

export default router

