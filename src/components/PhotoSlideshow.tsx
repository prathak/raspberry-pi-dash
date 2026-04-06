"use client";

import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

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

export default function PhotoSlideshow() {
  const { data: photos = [], error, isLoading } = useQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!photos || photos.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
        setIsTransitioning(false);
      }, 1000); // 1 second fade transition
    }, 15000); // Change every 15 seconds

    return () => clearInterval(interval);
  }, [photos.length]);

  if (isLoading) {
    return (
      <div className="glass-card p-6 h-64 flex items-center justify-center">
        <div className="text-white/60">Loading photos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 h-64 flex items-center justify-center">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load photos</span>
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="glass-card p-6 h-64 flex items-center justify-center">
        <div className="text-center text-white/60">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No photos configured</p>
          <p className="text-sm mt-1">Add photos to /public/photos or configure a source</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden h-64 md:h-80 lg:h-96 relative">
      {photos.map((photo, index) => {
        const isActive = index === currentIndex;
        const isNext = index === (currentIndex + 1) % photos.length;

        if (!isActive && !isNext) return null;

        return (
          <div
            key={photo.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={photo.url}
              alt={photo.alt || "Slideshow photo"}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for better text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        );
      })}

      {/* Photo indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-6"
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
