import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from '../utils/cookie.utils.js'
import { sendMail } from '../config/email.js'
import { getFirebaseAuth } from '../config/firebase.js'
import { logger } from '../config/logger.js'

export const register = async (req, res) => {
    const { fullname, email, phone, password } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email: email }, { phone: phone }] });
        if (existingUser) return res.status(403).json({ message: "User already exists" });
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            fullname: fullname,
            email: email,
            phone: phone,
            password: hashedPassword
        });
        await user.save()
        generateTokenAndSetCookie(user._id, res)
        res.status(201).json({ message: 'Registration successful', user: { id: user._id, fullname: user.fullname, email: user.email, phone: user.phone, role: user.role } })
    } catch (error) {
        logger.error({ err: error, email, phone }, 'Registration failed')
        return res.status(500).json({ message: "Internal server error" })
    }
};

export const login = async (req, res) => {
    const { phone, password } = req.body;
    try {
        const user = await User.findOne({ phone: phone });
        if (!user) return res.status(404).json({ message: "User not found" });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid password" });
        // Frontend will trigger Firebase SMS for this phone.
        res.status(200).json({ message: 'Proceed with phone OTP', success: true, requiresOtp: true, phone: user.phone })
    } catch (error) {
        logger.error({ err: error, phone }, 'Login failed')
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const logout = (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })
    res.json({ message: 'Logged out' })
}

export const me = async (req, res) => {
    const user = req.user
    res.status(200).json({ success: true, user: user })
}

export const verifyOtp = async (req, res) => {
    const { phone, firebaseIdToken } = req.body
    try {
        const user = await User.findOne({ phone })
        if (!user) return res.status(404).json({ message: 'User not found' })
        const auth = getFirebaseAuth()
        if (!auth) return res.status(500).json({ message: 'Phone verification not configured' })

        const decoded = await auth.verifyIdToken(firebaseIdToken)
        const tokenPhone = decoded.phone_number || decoded.phoneNumber
        if (!tokenPhone) return res.status(400).json({ message: 'Invalid Firebase token' })

        // Normalize E.164 for comparison (basic check)
        const normalize = (p) => (p || '').replace(/\s+/g, '')
        if (normalize(tokenPhone) !== normalize(user.phone)) {
            return res.status(400).json({ message: 'Phone mismatch' })
        }

        generateTokenAndSetCookie(user._id, res)
        logger.info({ userId: user._id }, 'Login successful')
        res.status(200).json({ message: 'Login successful', success: true })
    } catch (error) {
        logger.error({ err: error, phone }, 'OTP verification failed')
        return res.status(500).json({ message: 'Internal server error' })
    }
}