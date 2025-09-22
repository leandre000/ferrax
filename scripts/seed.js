import dotenv from 'dotenv'
import { connectDB } from '../config/db.js'
import User from '../models/user.model.js'
import Car from '../models/car.model.js'
import bcrypt from 'bcryptjs'

dotenv.config()

const sampleCars = (ownerId) => [
  {
    make: 'Toyota', model: 'Corolla', year: 2019, price: 13500, mileage: 42000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'sedan', color: 'white', location: 'Kigali', images: [
      'https://images.unsplash.com/photo-1542362567-b07e54358753',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a'
    ]
  },
  {
    make: 'Honda', model: 'Civic', year: 2020, price: 16500, mileage: 31000, fuelType: 'petrol', transmission: 'manual', bodyType: 'sedan', color: 'black', location: 'Kigali', images: [
      'https://images.unsplash.com/photo-1550355291-bbee04a92027',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'
    ]
  },
  {
    make: 'Ford', model: 'Focus', year: 2018, price: 11500, mileage: 55000, fuelType: 'diesel', transmission: 'manual', bodyType: 'hatchback', color: 'blue', location: 'Huye', images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70'
    ]
  },
  {
    make: 'Tesla', model: 'Model 3', year: 2021, price: 32000, mileage: 18000, fuelType: 'electric', transmission: 'automatic', bodyType: 'sedan', color: 'red', location: 'Musanze', images: [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a'
    ]
  },
  {
    make: 'BMW', model: 'X5', year: 2017, price: 28000, mileage: 69000, fuelType: 'diesel', transmission: 'automatic', bodyType: 'suv', color: 'grey', location: 'Kigali', images: [
      'https://images.unsplash.com/photo-1549921296-3b4a4f9d3bf0'
    ]
  },
  {
    make: 'Mercedes', model: 'C-Class', year: 2019, price: 29500, mileage: 36000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'sedan', color: 'silver', location: 'Rubavu', images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70'
    ]
  },
  {
    make: 'Audi', model: 'A4', year: 2018, price: 22000, mileage: 52000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'sedan', color: 'white', location: 'Kigali', images: [
      'https://images.unsplash.com/photo-1517940310602-485b3e1d2d5f'
    ]
  },
  {
    make: 'Nissan', model: 'Qashqai', year: 2017, price: 14500, mileage: 72000, fuelType: 'diesel', transmission: 'manual', bodyType: 'suv', color: 'green', location: 'Kigali', images: [
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023'
    ]
  },
  {
    make: 'Hyundai', model: 'Elantra', year: 2020, price: 17000, mileage: 28000, fuelType: 'petrol', transmission: 'automatic', bodyType: 'sedan', color: 'white', location: 'Kigali', images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'
    ]
  },
  {
    make: 'Kia', model: 'Sportage', year: 2019, price: 19000, mileage: 39000, fuelType: 'diesel', transmission: 'automatic', bodyType: 'suv', color: 'black', location: 'Rusizi', images: [
      'https://images.unsplash.com/photo-1542095734-386c7d1b7be1'
    ]
  }
].map((c) => ({ ...c, owner: ownerId, status: 'available', primaryImage: c.images[0] }))

const main = async () => {
  await connectDB()

  // Ensure default owner (admin)
  const email = 'owner@example.com'
  const phone = '+250780000000'
  let owner = await User.findOne({ email })
  if (!owner) {
    const salt = await bcrypt.genSalt(12)
    const hashed = await bcrypt.hash('Password123!', salt)
    owner = await User.create({ fullname: 'Default Owner', email, phone, password: hashed, role: 'admin' })
    console.log('Created owner user:', owner.email)
  }

  const countBefore = await Car.countDocuments()
  if (countBefore >= 10) {
    console.log('Cars already seeded (>=10). Skipping.')
    process.exit(0)
  }

  await Car.insertMany(sampleCars(owner._id))
  const countAfter = await Car.countDocuments()
  console.log(`Seeded cars. Total count: ${countAfter}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


