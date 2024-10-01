import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  const barangay = searchParams.get('barangay');

  if (!barangay) {
    return NextResponse.json({ error: "Barangay parameter is required" }, { status: 400 });
  }

  const adminApp = await initAdmin();
  const firestore = adminApp.firestore();

  try {
    // If UID is provided, fetch the specific queue item
    if (uid) {
      const queueDoc = await firestore.collection('barangays').doc(barangay).collection('queue').doc(uid).get();
      if (!queueDoc.exists) {
        return NextResponse.json({ error: "Data not found" }, { status: 404 });
      }
      return NextResponse.json({ data: { uid: queueDoc.id, ...queueDoc.data() } });
    }

    // If no UID, fetch all queue items
    const queueSnapshot = await firestore.collection('barangays').doc(barangay).collection('queue').get();
    const queueItems = queueSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ data: queueItems });
  } catch (error) {
    console.error('Error retrieving data:', error);
    return NextResponse.json({ error: "Failed to retrieve data" }, { status: 500 });
  }
}
