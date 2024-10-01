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
      const userDoc = await firestore.collection('queueing_history').doc(uid).get();
      if (!userDoc.exists) {
        return NextResponse.json({ error: "Data not found" }, { status: 404 });
      }
      return NextResponse.json({ data: { uid: userDoc.id, ...userDoc.data() } });
    }

    // If no UID, fetch all users, sorted by timestamp in descending order
    const usersSnapshot = await firestore.collection('queueing_history')
      .orderBy('timestamp', 'desc') // Sort by timestamp (most recent first)
      .get();

    const users = usersSnapshot.docs.map(doc => ({
      transactionId: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error retrieving data:', error);
    return NextResponse.json({ error: "Failed to retrieve data" }, { status: 500 });
  }
}
