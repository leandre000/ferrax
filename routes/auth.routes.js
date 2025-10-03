import express from 'express'
import { login, register, logout, me, verifyOtp } from '../controllers/auth.controllers.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = express.Router()

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user with email/phone/password and send OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullname, email, phone, password]
 *             properties:
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: OTP sent, proceed to verify
 */

router.post('/register', register)
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login with phone and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       200: { description: Login successful }
 */
router.post('/login', login)
/**
 * @openapi
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify phone OTP and issue session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, otpCode]
 *             properties:
 *               phone: { type: string }
 *               otpCode: { type: string }
 *     responses:
 *       200: { description: Registration completed }
 */
router.post('/verify-otp', verifyOtp)
router.post('/logout', protect, logout)
router.get('/me', protect, me)

export default router
