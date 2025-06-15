import { auth } from "@/lib/firebase";
import { AuthError, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { NextResponse } from "next/server";

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
   
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as AuthError;
      
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          return NextResponse.json(
            { error: 'Email already in use' },
            { status: 409 }
          );
        case 'auth/weak-password':
          return NextResponse.json(
            { error: 'Password should be at least 6 characters' },
            { status: 400 }
          );
        case 'auth/invalid-email':
          return NextResponse.json(
            { error: 'Invalid email format' },
            { status: 400 }
          );
      }
    }
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 400 }
    );
  }
}