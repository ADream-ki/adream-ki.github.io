"use client";
import { Cloud, Heart, Star } from "lucide-react";

export default function HeroAnimation() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main animated card */}
      <div className="relative w-72 h-72 md:w-80 md:h-80 bg-gradient-to-br from-primary-400 via-primary-500 to-accent-400 rounded-[3rem] shadow-anime flex items-center justify-center overflow-hidden">
        {/* Glass morphism overlay */}
        <div className="absolute inset-4 bg-white/20 rounded-[2.5rem] backdrop-blur-sm border-2 border-white/30 flex flex-col items-center justify-center gap-4">

          {/* Icons */}
          <div>
            <Cloud className="w-20 h-20 text-white drop-shadow-lg" />
          </div>

          <div className="flex gap-4">
            <Heart className="w-8 h-8 text-pink-200" fill="currentColor" />
            <Star className="w-8 h-8 text-yellow-200" fill="currentColor" />
          </div>

          <div className="text-white font-bold text-lg tracking-wide">
            Welcome!
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-accent-300 rounded-full opacity-40 blur-xl" />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-primary-300 rounded-full opacity-40 blur-xl" />
    </div>
  );
}
