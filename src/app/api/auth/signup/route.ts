import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { NextRequest,NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    const signInMethods = await fetchSignInMethodsForEmail(auth,email);
     if (signInMethods.length > 0) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 } 
      )
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return NextResponse.json({ user: userCredential.user });

  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 400 }
    )
  }
}