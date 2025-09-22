import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()

export const initFirebase = () => {
  if (admin.apps.length) return admin.app()
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase admin is not configured. Phone OTP verification will fail.')
    return null
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey })
  })
}

export const getFirebaseAuth = () => {
  const app = initFirebase()
  if (!app) return null
  return admin.auth()
}


