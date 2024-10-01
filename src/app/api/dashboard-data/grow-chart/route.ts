import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';

export async function GET(request: Request) {
    const adminApp = await initAdmin();
    const firestore = adminApp.firestore();

    try {
        // Fetch all queueing history records
        const snapshot = await firestore.collection('queueing_history').get();

        // Process results to convert timestamps to YYYY-MM-DD format
        const results = snapshot.docs.map(doc => {
            const data = doc.data();

            // Ensure we handle both Firestore Timestamp object and seconds format
            let timestampInSeconds;
            
            // If the timestamp is a Firestore Timestamp object
            if (data.timestamp && data.timestamp.seconds) {
                timestampInSeconds = data.timestamp.seconds;
            } 
            // If the timestamp is already in seconds format (number)
            else {
                timestampInSeconds = data.timestamp;
            }

            const dateObj = new Date(timestampInSeconds * 1000); // Convert to milliseconds
            const formattedDate = dateObj.toISOString().split("T")[0]; // Format to YYYY-MM-DD

            return { id: doc.id, ...data, formattedDate }; // Add the formatted date to the response
        });

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching queueing history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
