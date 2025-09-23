import nodemailer from 'nodemailer';
import { configDotenv } from 'dotenv';
import { logger } from './logger.js'

configDotenv()

export const mailer = nodemailer.createTransport({
  service: "gmail.com",
  auth: {
    user: process.env.SMTP_USER || 'nelsonprox92@gmail.com',
    pass: process.env.SMTP_PASS || 'your_password'
  }
})

export const sendMail = async ({ to, subject, html }) => {
  try {
    const from = process.env.MAIL_FROM || 'CarHubConnect <no-reply@carhubconnect.local>'
    const info = await mailer.sendMail({ from, to, subject, html })
    logger.info({ to, subject, messageId: info?.messageId }, 'Email sent')
    return info
  } catch (error) {
    logger.error({ err: error, to, subject }, 'Email send failed')
    throw new Error(error)
  }
}

