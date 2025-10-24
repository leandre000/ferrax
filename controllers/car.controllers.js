import Car from '../models/car.model.js'
import { logger } from '../config/logger.js'

export const createCar = async (req, res) => {
  try {
    const { images, primaryImage, ...rest } = req.body
    const data = { ...rest, owner: req.user._id }

    if (Array.isArray(images) && images.length > 0) {
      data.images = images
    }

    if (primaryImage) {
      data.primaryImage = primaryImage
    } else if (Array.isArray(images) && images.length > 0) {
      data.primaryImage = images[0]
    }

    const car = await Car.create(data)
    logger.info({ userId: req.user._id, carId: car._id }, 'Car created')
    res.status(201).json(car)
  } catch (error) {
    logger.error({ err: error, userId: req.user?._id }, 'Failed to create car')
    res.status(400).json({ message: 'Failed to create car', error: error.message })
  }
}

export const getCars = async (req, res) => {
  try {
    const { page = 1, limit = 20, q, status, brand, make } = req.query
    const filter = {}
    if (q) {
      filter.$or = [
        { make: new RegExp(q, 'i') },
        { model: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') }
      ]
    }
    if (status) {
      filter.status = status
    }
    if (brand) {
      filter.brand = brand
    }
    if (make) {
      filter.make = make
    }
    const cars = await Car.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('owner', 'fullname email')
    const count = await Car.countDocuments(filter)
    res.json({ items: cars, total: count, page: Number(page), limit: Number(limit) })
  } catch (error) {
    logger.error({ err: error, query: req.query }, 'Failed to fetch cars')
    res.status(500).json({ message: 'Failed to fetch cars', error: error })
  }
}

export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('owner', 'fullname email')
    if (!car) return res.status(404).json({ message: 'Car not found' })
    res.json(car)
  } catch (error) {
    logger.error({ err: error, carId: req.params.id }, 'Failed to fetch car by id')
    res.status(404).json({ message: 'Car not found' })
  }
}

export const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    const isOwner = car.owner.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' })
    const updates = { ...req.body }
    if (car.status === 'sold') {
      delete updates.status
    }
    Object.assign(car, updates)
    await car.save()
    logger.info({ carId: car._id, userId: req.user._id }, 'Car updated')
    res.json(car)
  } catch (error) {
    logger.error({ err: error, carId: req.params.id, userId: req.user?._id }, 'Failed to update car')
    res.status(400).json({ message: 'Failed to update car', error: error })
  }
}

export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    const isOwner = car.owner.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' })

    await car.deleteOne()
    logger.info({ carId: car._id, userId: req.user._id }, 'Car deleted')
    res.json({ message: 'Car deleted' })
  } catch (error) {
    logger.error({ err: error, carId: req.params.id, userId: req.user?._id }, 'Failed to delete car')
    res.status(400).json({ message: 'Failed to delete car', error: error.message })
  }
}

export const listMyCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id }).sort({ createdAt: -1 })
    res.json(cars)
  } catch (error) {
    logger.error({ err: error, userId: req.user?._id }, 'Failed to list my cars')
    res.status(500).json({ message: 'Failed to fetch cars' })
  }
}

export const reorderImages = async (req, res) => {
  try {
    const { id } = req.params
    const { images } = req.body // full ordered array
    if (!Array.isArray(images)) return res.status(400).json({ message: 'images must be array' })
    const car = await Car.findById(id)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    const isOwner = car.owner.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' })
    const setOld = new Set(car.images || [])
    const setNew = new Set(images)
    if (setOld.size !== setNew.size || [...setOld].some(u => !setNew.has(u))) {
      return res.status(400).json({ message: 'images must contain same URLs as existing' })
    }
    car.images = images
    if (!images.includes(car.primaryImage)) car.primaryImage = images[0] || ''
    await car.save()
    logger.info({ carId: car._id, userId: req.user._id }, 'Car images reordered')
    res.json(car)
  } catch (error) {
    logger.error({ err: error, carId: req.params.id, userId: req.user?._id }, 'Failed to reorder images')
    res.status(400).json({ message: 'Failed to reorder images' })
  }
}

export const setPrimaryImage = async (req, res) => {
  try {
    const { id } = req.params
    const { imageUrl } = req.body
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' })
    const car = await Car.findById(id)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    const isOwner = car.owner.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' })
    if (!(car.images || []).includes(imageUrl)) return res.status(400).json({ message: 'imageUrl must be one of the car images' })
    car.primaryImage = imageUrl
    await car.save()
    logger.info({ carId: car._id, userId: req.user._id }, 'Primary image set')
    res.json(car)
  } catch (error) {
    logger.error({ err: error, carId: req.params.id, userId: req.user?._id }, 'Failed to set primary image')
    res.status(400).json({ message: 'Failed to set primary image' })
  }
}

export const addCarImages = async (req, res) => {
  try {
    const { id } = req.params
    const { images } = req.body // array of cloudinary URLs
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'images must be a non-empty array' })
    }
    const car = await Car.findById(id)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
    car.images = [...(car.images || []), ...images]
    if (!car.primaryImage && car.images.length > 0) {
      car.primaryImage = car.images[0]
    }
    await car.save()
    logger.info({ carId: car._id, userId: req.user._id, count: images?.length }, 'Car images added')
    res.json(car)
  } catch (error) {
    logger.error({ err: error, carId: req.params.id, userId: req.user?._id }, 'Failed to add images')
    res.status(400).json({ message: 'Failed to add images' })
  }
}

export const removeCarImage = async (req, res) => {
  try {
    const { id } = req.params
    const { imageUrl } = req.body
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' })
    const car = await Car.findById(id)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
    car.images = (car.images || []).filter(u => u !== imageUrl)
    if (car.primaryImage === imageUrl) {
      car.primaryImage = car.images[0] || ''
    }
    await car.save()
    logger.info({ carId: car._id, userId: req.user._id }, 'Car image removed')
    res.json(car)
  } catch (error) {
    logger.error({ err: error, carId: req.params.id, userId: req.user?._id }, 'Failed to remove image')
    res.status(400).json({ message: 'Failed to remove image' })
  }
}

export const listCar = async (req, res) => {
  const { images, primaryImage, ...rest } = req.body
  const data = { ...rest, owner: req.user._id, status: 'listed' };
  try {
    const car = await Car.create(data);
    logger.info({ carId: car._id, userId: req.user._id }, 'Car listed')
    res.json({
      message: 'Car listed successfully',
      success: true,
      car
    })
  } catch (error) {
    logger.error({ err: error, userId: req.user?._id }, 'Failed to list car');
    return res.status(500).json({
      message: 'Failed to list car',
      success: false,
      error: error.message
    })
  }
}

export const verifyListedCar = async (req, res) => {
  try {
    const { id } = req.params
    const car = await Car.findById(id)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    if (car.status !== 'listed') return res.status(400).json({ message: 'Car is not listed' });
    car.status = "available";
    await car.save()
    return res.json({
      message: 'Car is listed',
      success: true,
      car
    })
  } catch (error) {
    logger.error({ err: error, carId: req.params.id, userId: req.user?._id }, 'Failed to verify listed')
    res.status(500).json({
      message: 'Failed to verify listed',
      success: false,
      error: error.message
    })
  }
}

export const getListedCars = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const cars = await Car.find({ status: 'listed' })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
    res.json({
      message: 'Listed cars retrieved successfully',
      success: true,
      cars,
      total: cars.length,
      page: Number(page),
      limit: Number(limit)
    })
  } catch (error) {
    logger.error({ err: error, query: req.query }, 'Failed to get listed cars')
    res.status(500).json({
      message: 'Failed to get listed cars',
      success: false,
      error: error.message
    })
  }
}

export const rejectListedCar = async (req, res) => {
  const { id } = req.params;
  try {
    const car = await Car.findById(id)
    if (!car) return res.status(404).json({ message: 'Car not found' })
    if (car.status !== 'listed') return res.status(400).json({ message: 'Car is not listed' });
    await car.deleteOne()
    return res.json({
      message: 'Car is rejected',
      success: true,
      car
    })
  } catch (error) {
    logger.error({ err: error, carId: req.params.id, userId: req.user?._id }, 'Failed to reject listed car')
    res.status(500).json({
      message: 'Failed to reject listed car',
      success: false,
      error: error.message
    })
  }
};