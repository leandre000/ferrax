import express from 'express'
import Stripe from 'stripe'
import Order from '../models/order.model.js'
import Car from '../models/car.model.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: "2024-06-20" })
const router = express.Router()

/**
 * @openapi
 * /api/webhooks/stripe:
 *   post:
 *     summary: Stripe webhook endpoint for payment processing
 *     description: Handles Stripe webhook events, particularly checkout.session.completed events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Stripe webhook event payload
 *     headers:
 *       stripe-signature:
 *         required: true
 *         schema:
 *           type: string
 *           description: Stripe signature for webhook verification
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *       400:
 *         description: Webhook verification failed
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session.metadata?.orderId
      if (orderId) {
        const order = await Order.findById(orderId)
        if (order && order.status === 'initiated') {
          order.status = 'paid'
          order.stripePaymentIntentId = session.payment_intent
          await order.save()

          const car = await Car.findById(order.car)
          if (car) {
            car.status = 'sold'
            car.reservedBy = undefined
            car.reservedUntil = undefined
            await car.save()
          }
        }
      }
    }

    res.json({ received: true })
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }
})

export default router

