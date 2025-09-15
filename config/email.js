import nodemailer from 'nodemailer'

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your@email.com',
    pass: process.env.SMTP_PASS || 'your_password'
  }
})

export const sendMail = async ({ to, subject, html }) => {
  const from = process.env.MAIL_FROM || 'CarHubConnect <no-reply@carhubconnect.local>'
  return mailer.sendMail({ from, to, subject, html })
}

