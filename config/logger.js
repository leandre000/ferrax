import pino from 'pino'

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
const isPretty = process.env.NODE_ENV !== 'production' && process.env.LOG_PRETTY !== 'false'

export const logger = pino({
  level,
  base: {
    service: 'carhubconnect',
    env: process.env.NODE_ENV || 'development'
  },
  transport: isPretty
    ? {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard', singleLine: false }
    }
    : undefined
})


