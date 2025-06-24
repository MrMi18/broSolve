import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

const adminDb = getFirestore()

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const targetId = searchParams.get('targetId')
    const targetType = searchParams.get('targetType')

    if (!targetId || !targetType || !['bug', 'answer'].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      )
    }

    // Verify authentication
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { userVote: null }, // Return null vote for unauthenticated users
        { status: 200 }
      )
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token)
      const userId = decodedToken.uid

      // Get user's vote for this item
      const voteId = `${userId}_${targetId}`
      const voteDoc = await adminDb.collection('votes').doc(voteId).get()

      const userVote = voteDoc.exists ? voteDoc.data()?.voteType : null

      return NextResponse.json({ userVote })

    } catch {
      // If token is invalid, return null vote
      return NextResponse.json(
        { userVote: null },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('Error fetching vote status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vote status' },
      { status: 500 }
    )
  }
}