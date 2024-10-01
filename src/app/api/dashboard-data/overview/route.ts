import { NextResponse } from 'next/server';
import { initAdmin } from '@/app/firebase/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore'; // Import Timestamp type

export async function GET() {
  const adminApp = await initAdmin();
  const firestore = adminApp.firestore();

  try {
    // Fetch terminal fee
    const feeRef = firestore.collection('dashboard-counts').doc('terminal-fee');
    const feeSnap = await feeRef.get();

    // Retrieve fee and lastUpdated fields
    const fee = feeSnap.exists ? feeSnap.data()?.fee || '₱0.00' : '₱0.00';

    // Handle Firestore Timestamp for terminal fee
    const lastUpdated = feeSnap.exists && feeSnap.data()?.lastUpdated 
      ? (feeSnap.data()?.lastUpdated instanceof Timestamp
        ? feeSnap.data()?.lastUpdated.toDate().toISOString() // Convert Timestamp to ISO string
        : 'Not available') 
      : 'Not available';

    // Fetch counts for drivers and passengers
    const driversSnap = await firestore.collection('users').where('role', '==', 'Driver').get();
    const driversCount = driversSnap.size;

    const passengersSnap = await firestore.collection('users').where('role', '==', 'Passenger').get();
    const passengersCount = passengersSnap.size;

    // Get the current timestamp
    const currentTimestamp = Timestamp.now();

    // Retrieve the current counts and last updated timestamps from Firestore
    const passengerCountsRef = firestore.collection('dashboard-counts').doc('passenger-counts');
    const passengerCountsSnap = await passengerCountsRef.get();
    const currentPassengerCount = passengerCountsSnap.exists ? passengerCountsSnap.data()?.['current-passenger-count'] : 0;
    const passengerLastUpdated = passengerCountsSnap.exists && passengerCountsSnap.data()?.passengerLastUpdated 
      ? passengerCountsSnap.data()?.passengerLastUpdated 
      : 'Not available';

    const driverCountsRef = firestore.collection('dashboard-counts').doc('driver-counts');
    const driverCountsSnap = await driverCountsRef.get();
    const currentDriverCount = driverCountsSnap.exists ? driverCountsSnap.data()?.['current-driver-count'] : 0;
    const driverLastUpdated = driverCountsSnap.exists && driverCountsSnap.data()?.driverLastUpdated
      ? driverCountsSnap.data()?.driverLastUpdated
      : 'Not available';

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
      fee,
      lastUpdated, // Terminal fee last updated
      driversCount,
      driverLastUpdated, // Driver last updated timestamp
      passengersCount,
      passengerLastUpdated, // Passenger last updated timestamp
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: "Failed to retrieve data" }, { status: 500 });
  }
}
