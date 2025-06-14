import { NextResponse } from 'next/server'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

export async function POST() {
  try {
    await signOut(auth)
    return NextResponse.json({ success: true })
  } catch  {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}