"use client";

import { useState } from "react";

interface CompanyLogoProps {
  src?: string;
  alt: string;
  size?: number;
}

export default function CompanyLogo({ src, alt, size = 40 }: CompanyLogoProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    // Fallback: First letter of company name in colored circle
    const initial = alt.charAt(0).toUpperCase();
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-cyan-500",
    ];
    const colorIndex = alt.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];

    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full ${bgColor} text-white font-bold`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  );
}