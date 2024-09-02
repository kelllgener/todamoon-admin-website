// components/DateTimeUpdater.tsx
import React, { useEffect, useState } from 'react';

const DateTimeUpdater: React.FC = () => {
  const [dateTime, setDateTime] = useState<string>(getCurrentDateTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(getCurrentDateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function getCurrentDateTime(): string {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return date.toLocaleString(undefined, options);
  }

  return <div>{dateTime}</div>;
};

export default DateTimeUpdater;
