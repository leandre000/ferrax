import mongoose from 'mongoose';

const testDriveSchema = mongoose.Schema({
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
    notes: { type: String, default: '' },
    preferredDate : { type : Date, required : true },
    preferredTime : { type : String, required : true },    
}, { timestamps: true });

const TestDrive = mongoose.model('TestDrive', testDriveSchema);

export default TestDrive