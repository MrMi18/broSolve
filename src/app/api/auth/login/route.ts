import { auth } from "@/lib/firebase";
import { 
  fetchSignInMethodsForEmail, 
  signInWithEmailAndPassword,
  AuthError 
} from "firebase/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    
    if (signInMethods.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 } 
      );
    }

    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    
    return NextResponse.json({
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
        
      }
    });

  } catch (error) {
    
    let errorMessage = 'Login failed';
    let statusCode = 400;

    if (typeof error === 'object' && error !== null && 'code' in error) {
      const authError = error as AuthError;
      
      switch (authError.code) {
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          statusCode = 401;
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Account temporarily locked due to many failed attempts';
          statusCode = 429;
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          statusCode = 403;
          break;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}