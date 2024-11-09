import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  const adminApp = await initAdmin();
  const firestore = adminApp.firestore();

  try {
    // If UID is provided, fetch the specific user's QR code URL
    if (uid) {
      const userDoc = await firestore.collection('qr_code').doc(uid).get();
      if (!userDoc.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userData = userDoc.data();
      // Only returning the qrCodeUrl
      const responseData = {
        qrCodeUrl: userData?.qrCodeUrl || null,
      };

      return NextResponse.json({ data: responseData });
    }

    return NextResponse.json({ error: "UID is required" }, { status: 400 });
  } catch (error) {
    console.error('Error retrieving QR code URL:', error);
    return NextResponse.json({ error: "Failed to retrieve QR code URL" }, { status: 500 });
  }
}
