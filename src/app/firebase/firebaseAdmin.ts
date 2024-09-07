import admin from 'firebase-admin';

export function createFirebaseAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Initialize Firebase Admin SDK using the default application credentials
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Set the default bucket from the env variable
  });
}

export async function initAdmin() {
  return createFirebaseAdminApp();
}
