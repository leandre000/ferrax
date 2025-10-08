import express from 'express';
import { addToWishlist, clearWishlist, deleteWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const wishlistRouter = express.Router();

/**
 * @openapi
 * /api/wishlist/add:
 *   post:
 *     tags: [Wishlist]
 *     summary: Add a car to the user's wishlist
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carId
 *             properties:
 *               carId:
 *                 type: string
 *                 description: ID of the car to add to wishlist
 *     responses:
 *       200:
 *         description: Car added to wishlist or already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Server error
 */
wishlistRouter.post('/add', protect,addToWishlist);

/**
 * @openapi
 * /api/wishlist/remove:
 *   post:
 *     tags: [Wishlist]
 *     summary: Remove a car from the user's wishlist
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carId
 *             properties:
 *               carId:
 *                 type: string
 *                 description: ID of the car to remove from wishlist
 *     responses:
 *       200:
 *         description: Car removed from wishlist or not found in wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Server error
 */
wishlistRouter.post('/remove', protect, removeFromWishlist);

/**
 * @openapi
 * /api/wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Get the authenticated user's wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Wishlist'
 *       500:
 *         description: Server error
 */
wishlistRouter.get('/',protect, getWishlist);

/**
 * @openapi
 * /api/wishlist/clear:
 *   delete:
 *     tags: [Wishlist]
 *     summary: Clear all items from the user's wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared successfully or was already empty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Server error
 */
wishlistRouter.delete('/clear', protect, clearWishlist);

/**
 * @openapi
 * /api/wishlist:
 *   delete:
 *     tags: [Wishlist]
 *     summary: Delete the user's wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist deleted successfully or not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Server error
 */
wishlistRouter.delete('/', protect, deleteWishlist);

export default wishlistRouter;