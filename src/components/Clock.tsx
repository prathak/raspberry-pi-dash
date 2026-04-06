"use client";

import { useEffect, useState } from "react";

export default function Clock({ showDate = true }: { showDate?: boolean }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const time = currentTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const date = currentTime.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight drop-shadow-lg">
        {time}
      </h1>
      {showDate && (
        <p className="text-sm md:text-base text-white/70 mt-1 font-light drop-shadow-sm">
          {date}
        </p>
      )}
    </div>
  );
}
