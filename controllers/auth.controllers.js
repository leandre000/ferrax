import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from '../utils/cookie.utils.js'
import { logger } from '../config/logger.js'
import { sendPhoneVerificationCode } from "../config/twilio.js";

const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Matches E.164 international phone number format
    return phoneRegex.test(phone);
}

export const register = async (req, res) => {
    const { fullname, email, phone, password } = req.body;
    if (!fullname || typeof fullname !== 'string' || fullname.trim().length < 2) {
        return res.status(400).json({ message: 'Invalid fullname' })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email' })
    }
    if (!validatePhoneNumber(phone)) return res.status(400).json({ message: "Invalid phone number" });
    if (!password || typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }
    try {
        const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
        if (existingUser) return res.status(403).json({ message: "User already exists" });
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            fullname: fullname.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            password: hashedPassword
        });
        // Always use a 6-digit, zero-padded string OTP
        const verificationCode = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
        const message = `Your OTP is ${verificationCode}`
        await sendPhoneVerificationCode(user.phone, message)
        user.otpCode = verificationCode
        user.otpExpiresAt = Date.now() + 60 * 60 * 1000 // 1 hour
        await user.save()
        // Do NOT issue JWT yet; wait until OTP verification completes
        res.status(201).json({ message: 'Proceed to check your phone for OTP', success: true, otpSent: true })
    } catch (error) {
        logger.error({ err: error, phone, email }, 'Registration failed')
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const login = async (req, res) => {
    const { phone, password } = req.body;
    try {
        if (!validatePhoneNumber(phone)) return res.status(400).json({ message: 'Invalid phone number' })
        if (!password || typeof password !== 'string') return res.status(400).json({ message: 'Password is required' })
        const user = await User.findOne({ phone: phone });
        if (!user) return res.status(404).json({ message: "User not found" });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid password" });
        generateTokenAndSetCookie(user._id, res)
        res.status(200).json({
            message: 'Login successful', success: true, user: {
                id: user._id,
                fullname: user.fullname,
                phone: user.phone,
                role: user.role
            }
        })
    } catch (error) {
        logger.error({ err: error, phone }, 'Login failed')
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production'
    })
    res.json({ message: 'Logged out' })
}

export const me = async (req, res) => {
    const user = req.user
    res.status(200).json({ success: true, user: user })
}

export const verifyOtp = async (req, res) => {
    const { phone, otpCode } = req.body
    try {
        const user = await User.findOne({ phone })
        if (!user) return res.status(404).json({ message: 'User not found' })
        if (!otpCode || typeof otpCode !== 'string') return res.status(400).json({ message: 'Invalid OTP code' })
        if (String(user.otpCode) !== String(otpCode)) return res.status(400).json({ message: 'Invalid OTP code' })
        if (user.otpExpiresAt < Date.now()) return res.status(400).json({ message: 'OTP code expired' })
        generateTokenAndSetCookie(user._id, res)
        logger.info({ userId: user._id }, 'User registered successfully')
        res.status(200).json({ message: 'Registration successful', success: true, otpVerified: true })
    } catch (error) {
        logger.error({ err: error, phone }, 'OTP verification failed')
        return res.status(500).json({ message: 'Internal server error' })
    }
}