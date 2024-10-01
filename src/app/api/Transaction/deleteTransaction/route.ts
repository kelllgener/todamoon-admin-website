import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';

export async function DELETE(request: Request) {
  const { transactionId } = await request.json(); // Read transactionId from request body

  if (!transactionId) {
    return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
  }

  try {
    const adminApp = await initAdmin();
    const firestore = adminApp.firestore();

    // Delete the specific transaction document with the provided transactionId
    await firestore.collection('queueing_history').doc(transactionId).delete();

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
