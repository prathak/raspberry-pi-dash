"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface Photo {
  id: string;
  url: string;
  alt?: string;
}

async function fetchPhotos(): Promise<Photo[]> {
  const res = await fetch("/api/photos");
  if (!res.ok) throw new Error("Failed to fetch photos");
  return res.json();
}

export default function PhotoSlideshow({ showTime }: { showTime?: boolean }) {
  const { data: photos = [] } = useQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
    refetchInterval: 60 * 1000,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!photos || photos.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [photos.length]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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
    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Photos */}
      {photos.length > 0 && photos.map((photo, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={photo.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={photo.url}
              alt={photo.alt || "Slideshow photo"}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
    </div>
  );
}
