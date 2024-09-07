import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';
import QRCode from 'qrcode';
import { Buffer } from 'buffer';
import { readFileSync } from 'fs';
import path from 'path';

import { hashPassword } from "@/app/utils/hash";

export async function POST(request: Request) {
  const { email, password, firstName, middleName, lastName, barangay, tricycleNumber, phoneNumber, plateImage, profileImage } = await request.json();

  try {
    const adminApp = await initAdmin();
    const auth = adminApp.auth();
    const firestore = adminApp.firestore();
    const bucket = adminApp.storage().bucket(); // Automatically use the default storage bucket

    const hashedPassword = hashPassword(password);

    // Create the user
    const userRecord = await auth.createUser({
      email,
      password: hashedPassword,
    });

    // Generate QR code URL
    const qrData = `Name: ${firstName} ${middleName} ${lastName}\nTricycle Number: ${tricycleNumber}\nIn Queue: false`;
    const qrCodeUrl = await generateQRCode(userRecord.uid, qrData, bucket);

    // Handle plate image upload
    let plateImageUrl = '';
    if (plateImage) {
      plateImageUrl = await uploadFile(plateImage, `plate_images/${userRecord.uid}.png`, bucket);
    }

    // Handle profile image upload
    let profileImageUrl = '';
    if (profileImage) {
      profileImageUrl = await uploadFile(profileImage, `profile_images/${userRecord.uid}.png`, bucket);
    } else {
      // If no profile image is provided, upload the default 'profile_user.png' from the public directory
      profileImageUrl = await uploadProfileImage(bucket, userRecord.uid);
    }

    // Save user data to Firestore
    await firestore.runTransaction(async (transaction) => {
      const userRef = firestore.collection('users').doc(userRecord.uid);
      const barangayRef = firestore.collection('barangays').doc(barangay);
      const driversInBarangayRef = barangayRef.collection('drivers').doc(userRecord.uid);

      transaction.set(userRef, {
        uid: userRecord.uid,
        name: `${firstName} ${middleName} ${lastName}`,
        barangay,
        tricycleNumber,
        email,
        phoneNumber,
        plateNumber: plateImageUrl,
        profileImage: profileImageUrl, // Updated to include the uploaded profile image
        balance: 500,
        role: 'Driver',
        inQueue: false,
        qrCodeUrl,
      });

      const driverInfo = {
        Name: `${firstName} ${middleName} ${lastName}`,
        TricycleNumber: tricycleNumber,
        inQueue: false,
      };

      transaction.set(driversInBarangayRef, driverInfo);
    });

    return NextResponse.json({ success: "Registration successful." });
  } catch (error) {
    // Provide more specific error messages based on error code
    let errorMessage = "Registration failed. Please try again later.";

    if (error instanceof Error && 'code' in error) {
      // Specific error handling for authentication errors
      if (error.code === 'auth/email-already-exists') {
        errorMessage = "This email address is already in use.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

const generateQRCode = async (uid: string, data: string, bucket: any) => {
  const qrCodeUrl = await QRCode.toDataURL(data);
  const qrCodeRef = bucket.file(`qrcodes/${uid}.png`);
  const buffer = Buffer.from(qrCodeUrl.split(',')[1], 'base64'); // Extract base64 part of the URL
  await qrCodeRef.save(buffer, { contentType: 'image/png' });
  return `https://storage.googleapis.com/${bucket.name}/qrcodes/${uid}.png`;
};

// Upload the file to the bucket
const uploadFile = async (file: string, path: string, bucket: any) => {
  const fileRef = bucket.file(path);
  const buffer = Buffer.from(file.split(",")[1], 'base64'); // Extract base64 part of the image file
  await fileRef.save(buffer, { contentType: 'image/png' });
  return `https://storage.googleapis.com/${bucket.name}/${path}`;
};

// Upload the default profile image from the public directory and rename it to the user's uid
const uploadProfileImage = async (bucket: any, uid: string) => {
  const fileRef = bucket.file(`profile_images/${uid}.png`); // Store the profile image under profile_images folder
  const filePath = path.join(process.cwd(), 'public', 'profile_user.png'); // Path to the default profile image
  const buffer = readFileSync(filePath); // Read the file from the public directory
  await fileRef.save(buffer, { contentType: 'image/png' });
  return `https://storage.googleapis.com/${bucket.name}/profile_images/${uid}.png`;
};
