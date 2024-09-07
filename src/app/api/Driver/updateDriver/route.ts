import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';
import { uploadFile } from '@/app/utils/uploadFile'; // Adjust path as necessary

export async function PUT(request: Request) {
  const { uid, firstName, middleName, lastName, phoneNumber, plateImage, profileImage } = await request.json();

  if (!uid) {
    return NextResponse.json({ error: "UID is required" }, { status: 400 });
  }

  try {
    const adminApp = await initAdmin();
    const firestore = adminApp.firestore();
    const bucket = adminApp.storage().bucket();

    const userRef = firestore.collection('users').doc(uid);

    const updates: any = {};
    if (firstName || middleName || lastName) {
      updates.name = `${firstName} ${middleName} ${lastName}`;
    }
    if (phoneNumber) {
      updates.phoneNumber = phoneNumber;
    }

    // Handle profile image update
    if (profileImage) {
      const profileImageUrl = await uploadFile(profileImage, `profile_images/${uid}.png`, bucket);
      updates.profileImage = profileImageUrl;
    }

    // Handle plate image update
    if (plateImage) {
      const plateImageUrl = await uploadFile(plateImage, `plate_images/${uid}.png`, bucket);
      updates.plateNumber = plateImageUrl;
    }

    await userRef.update(updates);

    return NextResponse.json({ success: "User updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
