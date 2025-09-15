import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { createBooking, confirmBooking, cancelBooking, listMyBookings } from '../controllers/booking.controllers.js'

const router = express.Router()

router.post('/', protect, createBooking)
router.post('/:id/confirm', protect, confirmBooking)
router.post('/:id/cancel', protect, cancelBooking)
router.get('/me', protect, listMyBookings)

export default router

