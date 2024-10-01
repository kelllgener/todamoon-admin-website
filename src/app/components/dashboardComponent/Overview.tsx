import { useEffect, useState } from 'react';
import OverviewCard from './OverviewCard';
import Loading from '../Loading';

interface OverviewData {
  fee: string;
  lastUpdated: string;
  driversCount: number;
  driverLastUpdated: string;
  passengersCount: number;
  passengerLastUpdated: string;
}

const Overview = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string): string => {
    let formattedDate = 'Not available';
    if (dateString) {
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = parsedDate.toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
        });
      }
    }
    return formattedDate;
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/dashboard-data/overview');
      const result = await response.json();

      if (response.ok) {
        setData({
          fee: result.fee,
          lastUpdated: formatDate(result.lastUpdated),
          driversCount: result.driversCount,
          driverLastUpdated: formatDate(result.driverLastUpdated),
          passengersCount: result.passengersCount,
          passengerLastUpdated: formatDate(result.passengerLastUpdated),
        });
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold">Overview</h2>
      <div className="space-y-4">
        <OverviewCard
          title="Current Terminal Fee"
          value={`₱${data?.fee || 'N/A'}.00`}
          lastUpdated={`Last Updated ${data?.lastUpdated || 'N/A'}`}
          changeColor="bg-green-100 text-green-700"
        />
        <OverviewCard
          title="Total Drivers"
          value={data?.driversCount.toLocaleString() || 'N/A'}
          lastUpdated={`Last Updated ${data?.driverLastUpdated || 'N/A'}`}
          changeColor="bg-green-100 text-green-700"
        />
        <OverviewCard
          title="Total Passengers"
          value={data?.passengersCount.toLocaleString() || 'N/A'}
          lastUpdated={`Last Updated ${data?.passengerLastUpdated || 'N/A'}`}
          changeColor="bg-green-100 text-green-700"
        />
      </div>
    </div>
  );
};

export default Overview;
