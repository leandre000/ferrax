import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { createCar, getCars, getCarById, updateCar, deleteCar } from '../controllers/car.controllers.js'

const router = express.Router()

router.get('/', getCars)
router.get('/:id', getCarById)
router.post('/', protect, createCar)
router.put('/:id', protect, updateCar)
router.delete('/:id', protect, deleteCar)

export default router

