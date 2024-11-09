import React from 'react';

interface OverviewCardProps {
  title: string;
  value: string;
  lastUpdated: string;
  changeColor: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, lastUpdated, changeColor }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-4 bg-white rounded-lg">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-bold">{value}</h3>
      </div>
      <span
        className={`mt-2 md:mt-0 px-3 py-1 rounded-md text-xs ${changeColor}`}
        style={{ whiteSpace: 'nowrap' }}
      >
        {lastUpdated}
      </span>
    </div>
  );
};

export default OverviewCard;
