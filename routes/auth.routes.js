import express from 'express'
import { login, register, logout, me, verifyOtp } from '../controllers/auth.controllers.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = express.Router()

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user with email/phone/password and go to login
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
/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and clear session
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out
 */
router.post('/logout', protect, logout)

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', protect, me)

export default router
