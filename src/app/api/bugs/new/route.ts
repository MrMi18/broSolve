import { auth, db } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { NextResponse } from 'next/server'



export async function POST(request:Request) {
    try {
        if (!auth.currentUser) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in" },
                { status: 401 }
            )
        }
       
        const{title,description,tags}  = await request.json();

        if (!title || !description || !tags) {
            return NextResponse.json(
                { error: "Missing required fields (title, description, or tags)" },
                { status: 400 }
            )
        }
        const docRef = await addDoc(collection(db, 'bugs'), {
            title: title,
            description: description,
            tags:tags.split(',').map((tag:string) => tag.trim()),
            // priority: request.body.priority || 'medium',
            status: 'open',
            createdBy: auth.currentUser?.uid,
            createdAt: serverTimestamp()
        })
        return NextResponse.json(
        { 
           message: "Bug submitted successfully",
           id: docRef.id 
        },
      { status: 201 }
    )
    } catch (error) {
        console.error("Submission error:", error)
    
    
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
