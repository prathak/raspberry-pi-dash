"use client";

import { useEffect, useState } from "react";

export default function Clock() {
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
    <div className="text-center py-8">
      <h1 className="text-7xl md:text-8xl lg:text-9xl font-light text-white tracking-tight">
        {time}
      </h1>
      <p className="text-xl md:text-2xl text-white/80 mt-2 font-light">
        {date}
      </p>
    </div>
  );
}
