import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    driverLicense : {
        type: String,
        default: ''
    },
    drivingExperience : {
        type: String,
        default: ''
    }
}, { timestamps: true })

const User = mongoose.model("User", userSchema);

export default User