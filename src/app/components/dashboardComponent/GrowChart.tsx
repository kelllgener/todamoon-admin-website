import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useEffect, useState } from "react";
import Loading from "../Loading";

const GrowthChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all queueing history data from API
        const response = await fetch('/api/dashboard-data/grow-chart');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const allData = await response.json();

        // Group data by formatted date and sum amounts
        const groupedData: { [key: string]: number } = {};

        allData.forEach((item: any) => {
          const dateKey = item.formattedDate; // Use the formatted date
          groupedData[dateKey] = (groupedData[dateKey] || 0) + (item.amount || 0); // Sum amounts
        });

        // Convert the grouped data to an array and sort by date
        const sortedData = Object.entries(groupedData)
          .map(([date, amount]) => ({ name: date, amount })) // Create an array of objects with date and summed amount
          .sort((a, b) => new Date(b.name).getTime() - new Date(a.name).getTime()); // Sort by date descending

        // Keep only the latest 7 days
        setData(sortedData.slice(0, 7));
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold">This Week Growth</h2>
      <div className="w-full overflow-x-auto">
        <BarChart
          width={600}
          height={330}
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#4ADE80" />
        </BarChart>
      </div>
    </div>
  );
};

export default GrowthChart;
