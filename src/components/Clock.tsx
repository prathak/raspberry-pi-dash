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
      <h1 className="text-6xl md:text-7xl lg:text-8xl font-light text-white tracking-tight">
        {time}
      </h1>
      {showDate && (
        <p className="text-lg md:text-xl text-white/80 mt-2 font-light">
          {date}
        </p>
      )}
    </div>
  );
}
