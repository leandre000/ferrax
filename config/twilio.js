import twilio from 'twilio';
import { configDotenv } from 'dotenv';
configDotenv()

export const sendPhoneVerificationCode = async (phone, message) => {
    try {
        await twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN).messages.create({
            body: message,
            to: phone,
            from: process.env.TWILIO_FROM_PHONE_NUMBER
        })
    } catch (error) {
        throw error
    }
}




