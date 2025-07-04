import { adminAuth } from '@/lib/firebase-admin'
import { getFirestore } from 'firebase-admin/firestore' // Add this import
import { NextResponse } from 'next/server'

interface Data  {
  title: string;
  description: string;
  tags: string;
} 

export async function POST(request: Request) {
  try {
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

     const data : Data = await request.json()
     const { title, description, tags } = data


    if (!title || !description || !tags) {
      return NextResponse.json(
        { error: "Missing required fields (title, description, or tags)" },
        { status: 400 }
      )
    }

   
    const adminDb = getFirestore()
    
    const docRef = await adminDb.collection('bugs').add({
      title,
      description,
      tags: typeof tags === 'string'
        ? tags.split(',').map(tag => tag.trim())
        : tags,
      status: 'open',
      createdBy: userId,
      votes: 0,
      createdAt: new Date() // Admin SDK uses Date objects
    })

    return NextResponse.json(
      { 
        message: "Bug submitted successfully",
        id: docRef.id 
      },
      { status: 201 }
    )
    
  } catch (error: unknown) {
      console.error("Submission error:", error)
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'auth/id-token-expired') {
          return NextResponse.json(
              { error: "Session expired. Please log in again." },
              { status: 401 }
          )
      }
  
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Failed to submit bug report"
      },
      { status: 500 }
    )
  }
}