import { useEffect, useState } from "react";
import Loading from "../Loading";

interface Activity {
  uid: string;
  inQueue: boolean;
  joinTime: {
    _seconds: number;
    _nanoseconds: number;
  };
  name: string;
  tricycleNumber: string;
}

interface ActivityTableProps {
  barangay: string;
}

const ActivityTable = ({ barangay }: ActivityTableProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/dashboard-data/recent-activity?barangay=${barangay}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setActivities(data.data || []);
        setLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [barangay]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Get today's date in 'YYYY-MM-DD' format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Format timestamp as a readable date
  const formatJoinTime = (joinTime: {
    _seconds: number;
    _nanoseconds: number;
  }) => {
    const date = new Date(joinTime._seconds * 1000);
    return date.toLocaleString();
  };

  // Filter activities for today and sort by joinTime
  const filteredAndSortedActivities = activities
    .filter((activity) => {
      const activityDate = new Date(activity.joinTime._seconds * 1000)
        .toISOString()
        .split("T")[0];
      return activityDate === getCurrentDate();
    })
    .sort((a, b) => a.joinTime._seconds - b.joinTime._seconds); // Sort in ascending order

  return (
    <table className="overflow-x-auto table-xs">
      <thead>
        <tr className="text-left text-gray-500 text-sm">
          <th>#</th>
          <th>Name</th>
          <th>Tricycle Number</th>
          <th>Status</th>
          <th>Join Time</th>
        </tr>
      </thead>
      <tbody>
        {filteredAndSortedActivities.map((activity, index) => (
          <tr key={activity.uid} className="border-b">
            <td>{index + 1}</td>
            <td className="py-4">{activity.name}</td>
            <td>{activity.tricycleNumber}</td>
            <td>
              <span
                className={
                  activity.inQueue
                    ? "text-success bg-green-100"
                    : "text-danger bg-red-100"
                }
              >
                {activity.inQueue ? "In Queue" : "Not In Queue"}
              </span>
            </td>
            <td>{formatJoinTime(activity.joinTime)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ActivityTable;
