import { useEffect, useState } from 'react';
import OverviewCard from './OverviewCard';
import Loading from '../Loading';

// Define types for fee data and API response
interface FeeData {
  fee: string;
  lastUpdated: string;
}

interface ApiResponse {
  feeData: Record<string, FeeData>;
  driversCount: number;
  driverLastUpdated: string;
  passengersCount: number;
  passengerLastUpdated: string;
}

const Overview = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard-data/overview');
        const result: ApiResponse = await response.json(); // Type the result here
  
        if (response.ok) {
          const formattedFees: Record<string, FeeData> = {};
          // Loop through each terminal fee in the response
          for (const [key, value] of Object.entries(result.feeData)) {
            formattedFees[key] = {
              fee: value.fee,
              lastUpdated: formatDate(value.lastUpdated),
            };
          }
  
          setData({
            feeData: formattedFees, // Ensure it matches the expected shape
            driversCount: result.driversCount,
            driverLastUpdated: formatDate(result.driverLastUpdated),
            passengersCount: result.passengersCount,
            passengerLastUpdated: formatDate(result.passengerLastUpdated),
          });
        } else {
          // console.error(result.error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold">Overview</h2>
      <div className="space-y-4">
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
        {data && data.feeData && Object.entries(data.feeData).map(([key, feeData]) => (
          <OverviewCard
            key={key}
            title={`${key.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}`}
            value={`₱${feeData.fee || 'N/A'}.00`}
            lastUpdated={`Last Updated ${feeData.lastUpdated || 'N/A'}`}
            changeColor="bg-green-100 text-green-700"
          />
        ))}
      </div>
    </div>
  );
};

export default Overview;
