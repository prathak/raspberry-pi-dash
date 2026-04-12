"use client";

import { useEffect, useState } from "react";

export default function Clock({ showDate = true }: { showDate?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
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

  if (!mounted) {
    return (
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-medium text-white tracking-tight drop-shadow-lg">
          &nbsp;
        </h1>
        {showDate && (
          <p className="text-base md:text-lg text-white/80 mt-1 font-medium drop-shadow-sm">
            &nbsp;
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-5xl md:text-6xl font-medium text-white tracking-tight drop-shadow-lg">
        {time}
      </h1>
      {showDate && (
        <p className="text-base md:text-lg text-white/80 mt-1 font-medium drop-shadow-sm">
          {date}
        </p>
        )}
    </div>
  );
}
