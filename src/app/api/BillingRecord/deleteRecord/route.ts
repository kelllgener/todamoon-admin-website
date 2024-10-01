import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';

export async function DELETE(request: Request) {
  const { recordId } = await request.json(); // Read transactionId from request body

  if (!recordId) {
    return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
  }

  try {
    const adminApp = await initAdmin();
    const firestore = adminApp.firestore();

    // Delete the specific transaction document with the provided transactionId
    await firestore.collection('billing_records').doc(recordId).delete();

    return NextResponse.json({ message: "Records deleted successfully" });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: "Failed to delete records" }, { status: 500 });
  }
}
