import { NextResponse } from "next/server";
import { initAdmin } from "@/app/firebase/firebaseAdmin";
import QRCode from "qrcode";
import { Buffer } from "buffer";
import { readFileSync } from "fs";
import path from "path";
import encrypt from "@/app/utils/crypto";
import firebase from "firebase/compat/app";

const SECRET_KEY = "Todamoon_drivers";

export async function POST(request: Request) {
  const startOperationTime = process.hrtime();

  const {
    email,
    password,
    firstName,
    middleName,
    lastName,
    barangay,
    tricycleNumber,
    phoneNumber,
    plateImage,
    plateNumberText,
    profileImage,
    licenseImage,
    operatorName,
  } = await request.json();

  try {
    const adminApp = await initAdmin();
    const firestore = adminApp.firestore();
    const bucket = adminApp.storage().bucket(); // Automatically use the default storage bucket

    let fullName = firstName + " " + middleName + " " + lastName;

    // Check if driver name and operator combination is unique
    const driverNameExists = await isNameUnique(fullName, operatorName, firestore);
    if (!driverNameExists) {
      return NextResponse.json(
        { error: "Driver with the same name and operator already exists." },
        { status: 400 }
      );
    }

    // Check if plateNumberText is unique
    const plateNumberExists = await isPlateNumberTextUnique(
      plateNumberText,
      firestore
    );
    if (!plateNumberExists) {
      return NextResponse.json(
        { error: "Plate number is already registered." },
        { status: 400 }
      );
    }

    // Create the user only after successful uploads and Firestore transaction
    const auth = adminApp.auth();
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // First upload plate image, then profile image, and save URLs
    let plateImageUrl = "";
    let profileImageUrl = "";
    let licenseImageUrl = "";

    plateImageUrl = plateImage
      ? await uploadFile(
          plateImage,
          `plate_images/${userRecord.uid}.png`,
          bucket
        )
      : null; // Or assign a default value if necessary

    profileImageUrl = profileImage
      ? await uploadFile(
          profileImage,
          `profile_images/${userRecord.uid}.png`,
          bucket
        )
      : await uploadDefaultProfileImage(userRecord.uid, bucket);

    licenseImageUrl = licenseImage
      ? await uploadFile(
          licenseImage,
          `license_images/${userRecord.uid}.png`,
          bucket
        )
      : null;

    // Save the driver data using the user ID
    await saveDriverToFirestore(
      userRecord.uid,
      {
        email,
        firstName,
        middleName,
        lastName,
        operatorName,
        barangay,
        tricycleNumber,
        phoneNumber,
        plateImageUrl,
        plateNumberText,
        profileImageUrl,
        licenseImageUrl,
      },
      firestore,
      bucket
    );

    const endOperationTime = process.hrtime(startOperationTime);
    const latencyTimeMs =
      endOperationTime[0] * 1000 + endOperationTime[1] / 1_000_000;
    console.log(
      `Total latency for every process: ${latencyTimeMs.toFixed(3)} ms`
    );

    return NextResponse.json({ success: "Registration successful." });
  } catch (error) {
    // Handle errors
    let errorMessage = "Registration failed. Please try again later.";

    if (error instanceof Error && "code" in error) {
      if (error.code === "auth/email-already-exists") {
        errorMessage = "This email address is already in use.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

const isNameUnique = async (
  name: string,
  operatorName: string,
  firestore: any
): Promise<boolean> => {
  const querySnapshot = await firestore
    .collection("users")
    .where("name", "==", name)
    .where("operatorName", "==", operatorName)
    .get();

  // If a document exists with the given name and operatorName combination, return false
  return querySnapshot.empty;
};

// Function to check if plateNumberText is unique
const isPlateNumberTextUnique = async (
  plateNumberText: string,
  firestore: any
): Promise<boolean> => {
  const querySnapshot = await firestore
    .collection("users")
    .where("plateNumberText", "==", plateNumberText)
    .get();

  // If a document exists with the given plateNumberText, return false
  return querySnapshot.empty;
};

// Function to upload file to Firebase Storage
const uploadFile = async (file: string, path: string, bucket: any) => {
  const fileRef = bucket.file(path);
  const buffer = Buffer.from(file.split(",")[1], "base64"); // Extract base64 part of the image file
  await fileRef.save(buffer, { contentType: "image/png" });

  // Get the download URL for the file
  const [url] = await fileRef.getSignedUrl({
    action: "read",
    expires: "03-01-2500", // Set a long expiration date for public access
  });

  return url;
};

// Upload default profile image if none is provided
const uploadDefaultProfileImage = async (uid: string, bucket: any) => {
  const fileRef = bucket.file(`profile_images/${uid}.png`);
  const filePath = path.join(process.cwd(), "public", "profile_user.png");
  const buffer = readFileSync(filePath);
  await fileRef.save(buffer, { contentType: "image/png" });

  const [url] = await fileRef.getSignedUrl({
    action: "read",
    expires: "03-01-2500",
  });

  return url;
};

// Save driver data to Firestore with profile and plate images URLs
const saveDriverToFirestore = async (
  uid: string,
  driverData: any,
  firestore: any,
  bucket: any
) => {
  const {
    email,
    firstName,
    middleName,
    lastName,
    operatorName,
    barangay,
    tricycleNumber,
    phoneNumber,
    plateNumberText,
    plateImageUrl,
    profileImageUrl,
    licenseImageUrl,
  } = driverData;

  const qrData = `uid: ${uid}`;
  const encryptedQrCode = encrypt(qrData, SECRET_KEY);
  const qrCodeUrl = await generateQRCode(uid, encryptedQrCode, bucket);

  await firestore.runTransaction(async (transaction: any) => {
    const userRef = firestore.collection("users").doc(uid);
    const barangayRef = firestore.collection("barangays").doc(barangay);
    const driversInBarangayRef = barangayRef.collection("drivers").doc(uid);

    transaction.set(userRef, {
      uid,
      name: `${firstName} ${middleName} ${lastName}`,
      operatorName,
      barangay,
      tricycleNumber,
      email,
      phoneNumber,
      plateNumber: plateImageUrl,
      plateNumberText,
      profileImage: profileImageUrl,
      balance: 0,
      role: "Driver",
      inQueue: false,
      driversLicence: licenseImageUrl,
    });

    transaction.set(driversInBarangayRef, {
      uid,
      name: `${firstName} ${middleName} ${lastName}`,
      tricycleNumber,
      inQueue: false,
    });

    // Save QR code URL to a separate collection
    const qrCodeRef = firestore.collection("qr_code").doc(uid);
    transaction.set(qrCodeRef, {
      qrCodeUrl,
    });
  });
};

// Generate a QR code and upload to Firebase Storage
const generateQRCode = async (uid: string, data: string, bucket: any) => {
  const qrCodeUrl = await QRCode.toDataURL(data);
  const qrCodeRef = bucket.file(`qrcodes/${uid}.png`);
  const buffer = Buffer.from(qrCodeUrl.split(",")[1], "base64");
  await qrCodeRef.save(buffer, { contentType: "image/png" });

  const [url] = await qrCodeRef.getSignedUrl({
    action: "read",
    expires: "03-01-2500",
  });

  return url;
};
