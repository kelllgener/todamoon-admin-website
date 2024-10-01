import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';

// Function to delete a document and its sub-collections
async function deleteDocumentWithSubCollections(docRef: FirebaseFirestore.DocumentReference) {
  const subCollections = await docRef.listCollections(); // Get all sub-collections
  for (const collection of subCollections) {
    const snapshot = await collection.get(); // Get all documents in the sub-collection
    for (const doc of snapshot.docs) {
      await deleteDocumentWithSubCollections(doc.ref); // Recursively delete sub-collections of each document
      await doc.ref.delete(); // Delete the document
    }
  }
  // Delete the parent document after sub-collections are deleted
  await docRef.delete();
}

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

    // Delete the sub-collections for queueing-transactions and billing-transactions
    const queueingTransactionsRef = firestore.collection(`users/${uid}/queueing-transactions`);
    const billingTransactionsRef = firestore.collection(`users/${uid}/billing-transactions`);

    const deleteSubCollection = async (subCollectionRef: FirebaseFirestore.CollectionReference) => {
      const snapshot = await subCollectionRef.get();
      if (!snapshot.empty) {
        for (const doc of snapshot.docs) {
          await doc.ref.delete();
        }
      }
    };

    // Delete sub-collections if they exist
    await deleteSubCollection(queueingTransactionsRef);
    await deleteSubCollection(billingTransactionsRef);

    // Delete user document after sub-collections
    await userDoc.ref.delete();

    // Delete user data from barangays collection
    const barangayDriverRef = firestore.collection(`barangays/${barangay}/drivers`).doc(uid);
    await barangayDriverRef.delete();

    const barangayDriverQueueRef = firestore.collection(`barangays/${barangay}/queue`).doc(uid);
    await barangayDriverQueueRef.delete();

    const qrCodeDoc = firestore.collection("qr_code").doc(uid);
    await qrCodeDoc.delete();

    // Construct file paths
    const profileImagePath = `profile_images/${uid}.png`;
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
