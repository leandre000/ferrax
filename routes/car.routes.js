import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { createCar, getCars, getCarById, updateCar, deleteCar, addCarImages, removeCarImage, setPrimaryImage, listMyCars, reorderImages } from '../controllers/car.controllers.js'

const router = express.Router()

/**
 * @openapi
 * /api/cars:
 *   get:
 *     summary: List cars with optional search and pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of cars
 */

router.get('/', getCars)
/**
 * @openapi
 * /api/cars/{id}:
 *   get:
 *     summary: Get a car by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Car detail }
 */
router.get('/:id', getCarById)
router.get('/me/mine', protect, listMyCars)
router.post('/', protect, createCar)
router.put('/:id', protect, updateCar)
router.delete('/:id', protect, deleteCar)
router.post('/:id/images', protect, addCarImages)
router.delete('/:id/images', protect, removeCarImage)
router.post('/:id/primary-image', protect, setPrimaryImage)
router.post('/:id/images/reorder', protect, reorderImages)

export default router

