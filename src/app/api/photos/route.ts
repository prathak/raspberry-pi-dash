import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Photo {
  id: string;
  url: string;
  alt?: string;
}

export async function GET() {
  // Look for photos in the public/photos directory
  const photosDir = path.join(process.cwd(), "public", "photos");

  try {
    if (!fs.existsSync(photosDir)) {
      // Return default photo - user's image or gradient background
      return NextResponse.json([
        { id: "default", url: "/DSCF1633.jpg", alt: "Default photo" },
        { id: "1", url: "https://picsum.photos/1920/1080?random=1", alt: "Random photo 1" },
        { id: "2", url: "https://picsum.photos/1920/1080?random=2", alt: "Random photo 2" },
      ]);
    }

    const files = fs.readdirSync(photosDir);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    const photos: Photo[] = files
      .filter((file) => imageExtensions.some((ext) => file.toLowerCase().endsWith(ext)))
      .map((file) => ({
        id: file,
        url: `/photos/${file}`,
        alt: file.replace(/\.[^/.]+$/, ""),
      }));

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error loading photos:", error);
    return NextResponse.json([]);
  }
}
