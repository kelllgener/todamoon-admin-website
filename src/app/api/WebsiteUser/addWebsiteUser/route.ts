import { NextApiRequest, NextApiResponse } from 'next';
import { initAdmin } from '@/app/firebase/firebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  const { email, password, role } = await request.json();

  // Validate request body
  if (!email || !password || !role) {
    return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
  }

  try {
    // Initialize Firebase Admin SDK
    const adminApp = await initAdmin();
    const auth = adminApp.auth();
    const firestore = adminApp.firestore();

    // Create user with email and password
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // Use Firestore collections and docs
    const userRef = firestore.collection('website-users').doc(userRecord.uid);
    await userRef.set({
      email: userRecord.email,
      uid: userRecord.uid,
      createdAt: new Date().toISOString(),
      role: role,
    });

    return new Response(JSON.stringify({ message: 'User created successfully', uid: userRecord.uid }), { status: 201 });
  } catch (error) {
    console.error('Error during sign-up:', error);

    // Handle Firebase Auth errors
    let errorMessage = 'An error occurred during sign-up. Please try again.';
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'auth/email-already-exists') {
        errorMessage = 'Email is already in use. Please use a different email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format. Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }
    }

    return new Response(JSON.stringify({ message: errorMessage }), { status: 400 });
  }
}
