import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { createBooking, confirmBooking, cancelBooking, listMyBookings, listBookingsAdmin, getBookingById } from '../controllers/booking.controllers.js'
import { requireAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     summary: Create a new booking for a car
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carId]
 *             properties:
 *               carId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Car not available or validation error
 *       404:
 *         description: Car not found
 */
router.post('/', protect, createBooking)

/**
 * @openapi
 * /api/bookings/{id}/confirm:
 *   post:
 *     summary: Confirm a pending booking
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
 *         description: Booking confirmed
 *       400:
 *         description: Cannot confirm booking or booking expired
 *       403:
 *         description: Forbidden - not the booking owner
 *       404:
 *         description: Booking not found
 */
router.post('/:id/confirm', protect, confirmBooking)

/**
 * @openapi
 * /api/bookings/{id}/cancel:
 *   post:
 *     summary: Cancel a booking
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
 *         description: Booking cancelled
 *       403:
 *         description: Forbidden - not the booking owner or admin
 *       404:
 *         description: Booking not found
 */
router.post('/:id/cancel', protect, cancelBooking)

/**
 * @openapi
 * /api/bookings/me:
 *   get:
 *     summary: Get current user's bookings
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 */
router.get('/me', protect, listMyBookings)

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     summary: Get all bookings (admin only)
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
 *           enum: [pending, confirmed, cancelled, expired]
 *     responses:
 *       200:
 *         description: Paginated list of all bookings
 *       403:
 *         description: Admin access required
 */
router.get('/', protect, requireAdmin, listBookingsAdmin)

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
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
 *         description: Booking details
 *       403:
 *         description: Forbidden - not the booking owner or admin
 *       404:
 *         description: Booking not found
 */
router.get('/:id', protect, getBookingById)

export default router

