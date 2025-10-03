import nodemailer from 'nodemailer';
import { configDotenv } from 'dotenv';
import { logger } from './logger.js'

configDotenv()

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
})

export const sendMail = async ({ to, subject, html }) => {
  try {
    const from = process.env.MAIL_FROM || 'CarHubConnect <no-reply@localhost>'
    const info = await mailer.sendMail({ from, to, subject, html })
    logger.info({ to, subject, messageId: info?.messageId }, 'Email sent')
    return info
  } catch (error) {
    logger.error({ err: error, to, subject }, 'Email send failed')
    throw error
  }
}

