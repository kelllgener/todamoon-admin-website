import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';

export async function PUT(request: Request) {
  const { uid, name, inQueue, phoneNumber, tricycleNumber, barangay, currentBarangay, newBarangay } = await request.json();

  if (!uid) {
    return NextResponse.json({ error: "UID is required" }, { status: 400 });
  }

  try {
    const adminApp = await initAdmin();
    const firestore = adminApp.firestore();

    const userRef = firestore.collection('users').doc(uid);

    const currentBarangayRef = firestore.collection('barangays').doc(currentBarangay)
      .collection('drivers').doc(uid);
    await currentBarangayRef.delete();

    const updates: any = {};
    if(name) {
      updates.name = name;
    }
    if (phoneNumber) {
      updates.phoneNumber = phoneNumber;
    }
    if(tricycleNumber) {
      updates.tricycleNumber = tricycleNumber;
    }
    if(barangay) {
      updates.barangay = barangay;
    }

    await userRef.update(updates);

    const newBarangayRef = firestore.collection('barangays').doc(newBarangay)
      .collection('drivers').doc(uid);

    const driverData = {
      name,
      inQueue,
      uid,
      tricycleNumber
    };

    await newBarangayRef.set(driverData);

    return NextResponse.json({ success: "User updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
