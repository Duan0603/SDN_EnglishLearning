import React from 'react';

export const Section5_Treasure = () => {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center px-4 text-center z-10 pointer-events-none">
      <div className="pointer-events-auto mt-32">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-glow-treasure to-amber-600 mb-6 drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">
          The Greatest Treasure
        </h2>
        <p className="text-xl md:text-3xl text-amber-100 font-light max-w-3xl mx-auto drop-shadow-lg">
          Is what you learn along the journey.
        </p>
      </div>
    </section>
  );
};
