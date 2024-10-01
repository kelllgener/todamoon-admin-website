import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';

export async function DELETE(request: Request) {
  const { uid } = await request.json(); // Read transactionId from request body

  if (!uid) {
    return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
  }

  try {
    const adminApp = await initAdmin();
    const auth = adminApp.auth();
    const firestore = adminApp.firestore();

    // Delete user from Firebase Authentication
    await auth.deleteUser(uid);

    // Delete the specific transaction document with the provided transactionId
    await firestore.collection('users').doc(uid).delete();

    return NextResponse.json({ message: "Passenger deleted successfully" });
  } catch (error) {
    console.error('Error deleting passenger:', error);
    return NextResponse.json({ error: "Failed to delete passenger" }, { status: 500 });
  }
}
