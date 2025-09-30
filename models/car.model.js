import mongoose from 'mongoose'

const carSchema = new mongoose.Schema({
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'reserved', 'sold', 'rented'], default: 'available' },
  reservedUntil: { type: Date },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mileage: { type: Number, default: 0 },
  vin: { type: String, sparse: true, trim: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  primaryImage: { type: String, default: '' },
  location: { type: String, default: '' },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid', 'other'], default: 'other' },
  transmission: { type: String, enum: ['automatic', 'manual'], required: true },
  bodyType: { type: String, default: '' },
  color: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

const Car = mongoose.model('Car', carSchema)

export default Car
