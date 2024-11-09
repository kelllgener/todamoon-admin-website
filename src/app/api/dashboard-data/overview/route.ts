import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore'; // Import Timestamp type

export async function GET() {
  const adminApp = await initAdmin();
  const firestore = adminApp.firestore();

  try {
    // Terminal fee document IDs
    const terminalFees = [
      'barandal-terminal-fee',
      'bubuyan-terminal-fee',
      'bunggo-terminal-fee',
      'burol-terminal-fee',
      'kay-anlog-terminal-fee',
      'prinza-terminal-fee',
      'punta-terminal-fee'
    ];

    // Initialize an object to store all terminal fees data
    const feeData: Record<string, { fee: string; lastUpdated: string }> = {};

    // Fetch all terminal fee documents
    for (const feeId of terminalFees) {
      const feeRef = firestore.collection('dashboard-counts').doc(feeId);
      const feeSnap = await feeRef.get();
      
      // If the document exists, store its data
      if (feeSnap.exists) {
        const data = feeSnap.data();
        feeData[feeId] = {
          fee: data?.fee || '₱0.00',
          lastUpdated: data?.lastUpdated instanceof Timestamp
            ? data.lastUpdated.toDate().toISOString()
            : 'Not available'
        };
      } else {
        feeData[feeId] = { fee: '₱0.00', lastUpdated: 'Not available' };
      }
    }

    // Fetch counts for drivers and passengers
    const driversSnap = await firestore.collection('users').where('role', '==', 'Driver').get();
    const driversCount = driversSnap.size;

    const passengersSnap = await firestore.collection('users').where('role', '==', 'Passenger').get();
    const passengersCount = passengersSnap.size;

    // Get the current timestamp
    const currentTimestamp = Timestamp.now();

    // Fetch and retrieve passenger counts document data
    const passengerCountsRef = firestore.collection('dashboard-counts').doc('passenger-counts');
    const passengerCountsSnap = await passengerCountsRef.get();
    const currentPassengerCount = passengerCountsSnap.exists ? passengerCountsSnap.data()?.['current-passenger-count'] || 0 : 0;
    const passengerLastUpdated = passengerCountsSnap.exists ? passengerCountsSnap.data()?.passengerLastUpdated || 'Not available' : 'Not available';

    // Fetch and retrieve driver counts document data
    const driverCountsRef = firestore.collection('dashboard-counts').doc('driver-counts');
    const driverCountsSnap = await driverCountsRef.get();
    const currentDriverCount = driverCountsSnap.exists ? driverCountsSnap.data()?.['current-driver-count'] || 0 : 0;
    const driverLastUpdated = driverCountsSnap.exists ? driverCountsSnap.data()?.driverLastUpdated || 'Not available' : 'Not available';

    // Update Firestore only if counts have changed
    if (passengersCount !== currentPassengerCount) {
      await passengerCountsRef.set({
        'current-passenger-count': passengersCount,
        passengerLastUpdated: currentTimestamp.toDate().toISOString(),
      });
    }

    if (driversCount !== currentDriverCount) {
      await driverCountsRef.set({
        'current-driver-count': driversCount,
        driverLastUpdated: currentTimestamp.toDate().toISOString(),
      });
    }

    return NextResponse.json({
      feeData,  // Returns all terminal fees data
      driversCount,  // Current drivers count
      driverLastUpdated,  // Driver counts last updated
      passengersCount,  // Current passengers count
      passengerLastUpdated,  // Passenger counts last updated
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: "Failed to retrieve data" }, { status: 500 });
  }
}
