import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin SDK
const app = admin.apps.length === 0 ? admin.initializeApp() : admin.app();
const db = app.firestore();

const ESP32_IP = '192.168.18.14'; // Replace with your ESP32 IP address

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { queueData } = req.body;

      // Write to Firestore
      const barangayRef = db.collection('barangays').doc(queueData.barangay || 'default_barangay');
      const queueRef = barangayRef.collection('queue').doc(queueData.uid);

      await queueRef.set({
        ...queueData,
        joinTime: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ message: 'Queue updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update queue', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
