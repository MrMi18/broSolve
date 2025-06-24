import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

const adminDb = getFirestore()

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    const { targetId, targetType, voteType, parentId } = await request.json()

    if (!targetId || !targetType || !['bug', 'answer'].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      )
    }

    // For bug votes, only allow 'up' or null
    if (targetType === 'bug' && voteType && voteType !== 'up') {
      return NextResponse.json(
        { error: "Bug votes only support 'up' or null" },
        { status: 400 }
      )
    }

    // Use Firestore transaction for consistency
    const result = await adminDb.runTransaction(async (transaction) => {
      // Collection references
      const voteId = `${userId}_${targetId}`
      const voteRef = adminDb.collection('votes').doc(voteId)
      
      let itemRef
      if (targetType === 'bug') {
        itemRef = adminDb.collection('bugs').doc(targetId)
      } else {
        // For answers, we need the parentId (bug ID)
        if (!parentId) {
          throw new Error('Parent ID required for answer votes')
        }
        itemRef = adminDb.collection('bugs').doc(parentId).collection('answers').doc(targetId)
      }

      // Get current vote and item
      const [voteDoc, itemDoc] = await Promise.all([
        transaction.get(voteRef),
        transaction.get(itemRef)
      ])

      if (!itemDoc.exists) {
        throw new Error('Item not found')
      }

      const currentItem = itemDoc.data()!
      const currentVote = voteDoc.exists ? voteDoc.data()?.voteType : null
      const currentVotes = currentItem.votes || 0

      let voteDelta = 0
      
      if (voteType === null) {
        // Remove vote
        if (currentVote) {
          voteDelta = currentVote === 'up' ? -1 : 1
          transaction.delete(voteRef)
        }
      } else {
        // Add or change vote
        if (currentVote === null) {
          // New vote
          voteDelta = voteType === 'up' ? 1 : -1
        } else if (currentVote !== voteType) {
          // Change vote
          voteDelta = voteType === 'up' ? 2 : -2
        }
        // If same vote type, no change (shouldn't happen from UI)

        // Update or create vote document
        transaction.set(voteRef, {
          userId,
          targetId,
          targetType,
          voteType,
          parentId: targetType === 'answer' ? parentId : null,
          createdAt: new Date()
        })
      }

      // Update item vote count
      const newVoteCount = Math.max(0, currentVotes + voteDelta) // Ensure non-negative for bugs
      transaction.update(itemRef, {
        votes: newVoteCount,
        updatedAt: new Date()
      })

      return { newVoteCount, userVote: voteType }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error handling vote:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}