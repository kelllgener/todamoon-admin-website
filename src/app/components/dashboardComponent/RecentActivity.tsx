import React from 'react';
import ActivityTable from "./ActivityTable";

const RecentActivity = () => {
  const barangays = [
    "Barandal",
    "Bubuyan",
    "Bunggo",
    "Burol",
    "Kay-anlog",
    "Prinza",
    "Punta",
  ];

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-6">Recent Queueing Activity</h2>
      <div className="flex flex-col">
        <div role="tablist" className="tabs tabs-lifted overflow-x-auto">
          {barangays.map((barangay) => (
            <React.Fragment key={barangay}>
              <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                className="tab"
                aria-label={barangay}
                defaultChecked={barangay === "Barandal"}
              />
              <div role="tabpanel" className="tab-content p-4">
                <ActivityTable barangay={barangay} />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
