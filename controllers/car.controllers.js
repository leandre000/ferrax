import Car from '../models/car.model.js'

export const createCar = async (req, res) => {
  try {
    const data = { ...req.body, owner: req.user._id }
    const car = await Car.create(data)
    res.status(201).json(car)
  } catch (error) {
    res.status(400).json({ message: 'Failed to create car', error: error.message })
  }
}

export const getCars = async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query
    const filter = {}
    if (q) {
      filter.$or = [
        { make: new RegExp(q, 'i') },
        { model: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') }
      ]
    }
    const cars = await Car.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('owner', 'fullname email')
    const count = await Car.countDocuments(filter)
    res.json({ items: cars, total: count, page: Number(page), limit: Number(limit) })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cars' })
  }
}

export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('owner', 'fullname email')
    if (!car) return res.status(404).json({ message: 'Car not found' })
    res.json(car)
  } catch (error) {
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

    Object.assign(car, req.body)
    await car.save()
    res.json(car)
  } catch (error) {
    res.status(400).json({ message: 'Failed to update car' })
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
    res.json({ message: 'Car deleted' })
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete car' })
  }
}

