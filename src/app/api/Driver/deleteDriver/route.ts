import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';

export async function DELETE(request: Request) {
  const { uid } = await request.json();

  if (!uid) {
    return NextResponse.json({ error: "UID is required" }, { status: 400 });
  }

  try {
    const adminApp = await initAdmin();
    const auth = adminApp.auth();
    const firestore = adminApp.firestore();
    const bucket = adminApp.storage().bucket(); // Access the storage bucket

    // Fetch user data to get the barangay
    const userDoc = await firestore.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const barangay = userData?.barangay;

    if (!barangay) {
      return NextResponse.json({ error: "Barangay not found for user" }, { status: 404 });
    }

    // Delete user from Firebase Authentication
    await auth.deleteUser(uid);

    // Delete user data from Firestore
    await userDoc.ref.delete();

    // Delete user data from barangays collection
    const barangayDriverRef = firestore.collection(`barangays/${barangay}/drivers`).doc(uid);
    await barangayDriverRef.delete();

    const barangayDriverQueueRef = firestore.collection(`barangays/${barangay}/queue`).doc(uid);
    await barangayDriverQueueRef.delete();

    // Construct file paths
    const profileImagePath = `plate_images/${uid}.png`;
    const plateImagePath = `plate_images/${uid}.png`;
    const qrCodePath = `qrcodes/${uid}.png`;

    // Delete files from Firebase Storage
    const deleteFile = async (path: string) => {
      const file = bucket.file(path);
      try {
        await file.delete();
        console.log(`Successfully deleted file: ${path}`);
      } catch (error) {
        console.error(`Error deleting file: ${path}`, error);
      }
    };

    await deleteFile(profileImagePath);
    await deleteFile(plateImagePath);
    await deleteFile(qrCodePath);

    return NextResponse.json({ success: "User and all associated data deleted successfully" });
  } catch (error) {
    console.error('Error deleting user and data:', error);
    return NextResponse.json({ error: "Failed to delete user and data" }, { status: 500 });
  }
}
