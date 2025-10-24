import express from 'express'
import { protect, requireAdmin } from '../middlewares/auth.middleware.js'
import { createCar, getCars, getCarById, updateCar, deleteCar, addCarImages, removeCarImage, setPrimaryImage, listMyCars, reorderImages, verifyListedCar, rejectListedCar, getListedCars, listCar } from '../controllers/car.controllers.js'

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Car'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get('/', getCars)

/**
 * @openapi
 * /api/cars/me/mine:
 *   get:
 *     summary: Get current user's cars
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user's cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Car'
 */
router.get('/me/mine', protect, listMyCars)

/**
 * @openapi
 * /api/cars:
 *   post:
 *     summary: Create a new car
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [make, model, year, price, transmission]
 *             properties:
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               price:
 *                 type: number
 *               transmission:
 *                 type: string
 *                 enum: [automatic, manual]
 *               mileage:
 *                 type: number
 *               vin:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               primaryImage:
 *                 type: string
 *               location:
 *                 type: string
 *               fuelType:
 *                 type: string
 *                 enum: [petrol, diesel, electric, hybrid, other]
 *               bodyType:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Car created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       400:
 *         description: Validation error
 */
router.post('/', protect, createCar)

/**
 * @openapi
 * /api/cars/{id}:
 *   put:
 *     summary: Update a car
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, reserved, sold, rented]
 *               mileage:
 *                 type: number
 *               vin:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               primaryImage:
 *                 type: string
 *               location:
 *                 type: string
 *               fuelType:
 *                 type: string
 *                 enum: [petrol, diesel, electric, hybrid, other]
 *               bodyType:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Car updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       403:
 *         description: Forbidden - not the car owner or admin
 *       404:
 *         description: Car not found
 */
router.put('/:id', protect, updateCar)

/**
 * @openapi
 * /api/cars/{id}:
 *   delete:
 *     summary: Delete a car
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       403:
 *         description: Forbidden - not the car owner or admin
 *       404:
 *         description: Car not found
 */
router.delete('/:id', protect, deleteCar)

/**
 * @openapi
 * /api/cars/{id}/images:
 *   post:
 *     summary: Add images to a car (admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [images]
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *     responses:
 *       200:
 *         description: Images added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Car not found
 */
router.post('/:id/images', protect, addCarImages)

/**
 * @openapi
 * /api/cars/{id}/images:
 *   delete:
 *     summary: Remove an image from a car (admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [imageUrl]
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to remove
 *     responses:
 *       200:
 *         description: Image removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Car not found
 */
router.delete('/:id/images', protect, removeCarImage)

/**
 * @openapi
 * /api/cars/{id}/primary-image:
 *   post:
 *     summary: Set primary image for a car
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [imageUrl]
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to set as primary
 *     responses:
 *       200:
 *         description: Primary image set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       400:
 *         description: Image URL must be one of the car images
 *       403:
 *         description: Forbidden - not the car owner or admin
 *       404:
 *         description: Car not found
 */
router.post('/:id/primary-image', protect, setPrimaryImage)

/**
 * @openapi
 * /api/cars/{id}/images/reorder:
 *   post:
 *     summary: Reorder car images
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [images]
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Full ordered array of image URLs
 *     responses:
 *       200:
 *         description: Images reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       400:
 *         description: Images must contain same URLs as existing
 *       403:
 *         description: Forbidden - not the car owner or admin
 *       404:
 *         description: Car not found
 */
router.post('/:id/images/reorder', protect, reorderImages);

/**
 * @openapi
 * /api/cars/list:
 *   post:
 *     summary: List a car
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carId, price, description, images, primaryImage, location]
 *             properties:
 *               carId:
 *                 type: string
 *                 description: ID of the car to list
 *               price:
 *                 type: number
 *                 description: Price of the car
 *               description:
 *                 type: string
 *                 description: Description of the car
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *               primaryImage:
 *                 type: string
 *                 description: URL of the primary image
 *               location:
 *                 type: string
 *                 description: Location of the car
 *               fuelType:
 *                 type: string
 *                 enum: [petrol, diesel, electric, hybrid, other]
 *                 description: Fuel type of the car
 *               bodyType:
 *                 type: string
 *                 description: Body type of the car
 *               color:
 *                 type: string
 *                 description: Color of the car
 *               year:
 *                 type: number
 *                 description: Year of the car
 *               make:
 *                 type: string
 *                 description: Make of the car
 *               model:
 *                 type: string
 *                 description: Model of the car
 *               mileage:
 *                 type: number
 *                 description: Mileage of the car
 *               vin:
 *                 type: string
 *                 description: VIN of the car
 *               transmission:
 *                 type: string
 *                 enum: [automatic, manual]
 *                 description: Transmission of the car
 *     responses:
 *       200:
 *         description: Car listed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       403:
 *         description: Forbidden - not the car owner or admin
 *       404:
 *         description: Car not found
 */
router.post('/list', protect, listCar);

/**
 * @openapi
 * /api/cars/{id}/verify:
 *   post:
 *     summary: Verify a listed car
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Car verified successfully
 */
router.post('/:id/verify', protect, requireAdmin, verifyListedCar);

/**
 * @openapi
 * /api/cars/{id}/reject:
 *   post:
 *     summary: Reject a listed car
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Car rejected successfully
 *       403:
 *         description: Forbidden - not the car owner or admin
 *       404:
 *         description: Car not found
 */
router.post('/:id/reject', protect, requireAdmin, rejectListedCar);

/**
 * @openapi
 * /api/cars/listed:
 *   get:
 *     summary: Get all listed cars
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Listed cars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Car'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       403:
 *         description: Forbidden - not admin
 */
router.get('/listed', protect, requireAdmin, getListedCars);

/**
 * @openapi
 * /api/cars/car/:id:
 *   get:
 *     summary: Get a car by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Car detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       403:
 *         description: Forbidden - not the car owner or admin
 *       404:
 *         description: Car not found
 */
router.get('/car/:id', protect, getCarById)

export default router