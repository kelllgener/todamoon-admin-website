import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  const adminApp = await initAdmin();
  const firestore = adminApp.firestore();

  try {
    // If UID is provided, fetch the specific user
    if (uid) {
      const userDoc = await firestore.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ data: userDoc.data() });
    }

    // If no UID, fetch all users with role = "Driver"
    const usersSnapshot = await firestore
      .collection('users')
      .where('role', '==', 'Driver')
      .get();

    const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return NextResponse.json({ error: "Failed to retrieve user data" }, { status: 500 });
  }
}
