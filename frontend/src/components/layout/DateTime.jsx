import { useState, useEffect } from 'react';

const DateTime = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium whitespace-nowrap">
      {formatDate(currentDateTime)}
    </div>
  );
};

export default DateTime;
