import express from 'express';
import { protect, requireAdmin } from '../middlewares/auth.middleware.js';
import { createBrand, deleteBrand, getAllBrands, getBrandById, updateBrand } from '../controllers/brands.controllers.js';

const router = express.Router()

/**
 * @openapi
 * /brands:
 *   post:
 *     summary: Create a new brand
 *     description: Create a new brand with the provided name, count, and logo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the brand.
 *               count:
 *                 type: integer
 *                 description: The count of the brand.
 *               logo:
 *                 type: string
 *                 description: The logo url of the brand.
 *     responses:
 *       201:
 *         description: Brand created successfully.
 *       400:
 *         description: Bad request. Invalid input data.
 *       500:
 *         description: Internal server error.
 */
router.post("/", protect, requireAdmin, createBrand);

/**
 * @openapi
 * /brands:
 *   get:
 *     summary: Get all brands
 *     description: Retrieve a list of all brands.
 *     responses:
 *       200:
 *         description: A list of brands.
 *       500:
 *         description: Internal server error.
 */
router.get("/", getAllBrands);

/**
 * @openapi
 * /brands/{brandId}:
 *   get:
 *     summary: Get brand by ID
 *     description: Retrieve a brand by its ID.
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         description: The ID of the brand to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A brand object.
 *       404:
 *         description: Brand not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/:brandId", protect, getBrandById);

/**
 * @openapi
 * /brands/{brandId}:
 *   put:
 *     summary: Update brand by ID
 *     description: Update a brand by its ID.
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         description: The ID of the brand to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the brand.
 *               count:
 *                 type: integer
 *                 description: The count of the brand.
 *               logo:
 *                 type: string
 *                 description: The logo url of the brand.
 *     responses:
 *       200:
 *         description: Brand updated successfully.
 *       400:
 *         description: Bad request. Invalid input data.
 *       404:
 *         description: Brand not found.
 * 
 */
router.put("/:brandId", protect, requireAdmin, updateBrand);

/**
 * @openapi
 * /brands/{brandId}:
 *   delete:
 *     summary: Delete brand by ID
 *     description: Delete a brand by its ID.
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         description: The ID of the brand to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand deleted successfully.
 *       404:
 *         description: Brand not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/:brandId", protect, requireAdmin, deleteBrand);

export default router
