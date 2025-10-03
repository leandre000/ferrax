import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookie = (userId, res) => {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new Error('JWT_SECRET is not configured')
    }
    try {
        const payload = { id: userId }
        const token = jwt.sign(payload, secret, { expiresIn: '15d' })
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 24 * 60 * 60 * 1000
        })
    } catch (error) {
        throw error
    }
}