import { cert, initializeApp, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore' // Add this

const serviceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_KEY as string
)

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  })
}

export const adminAuth = getAuth()
export const adminDb = getFirestore()