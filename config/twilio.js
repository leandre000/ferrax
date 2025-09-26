import twilio from 'twilio';
import { configDotenv } from 'dotenv';
configDotenv()

export const sendPhoneVerificationCode = async (message) => {
    try {
        await twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN).messages.create({
            body : message,
            to : process.env.TWILIO_PHONE_NUMBER,
            from : process.env.TWILIO_FROM_PHONE_NUMBER
        })
    } catch (error) {
        throw new Error(error)
    }
}




