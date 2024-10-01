import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const app = admin.apps.length === 0 ? admin.initializeApp() : admin.app();
const db = app.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { transactionData } = req.body;

      const userRef = db.collection('users').doc(transactionData.uid);
      await userRef.collection('queueing-transactions').add({
        ...transactionData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ message: 'Transaction updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update transaction', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
