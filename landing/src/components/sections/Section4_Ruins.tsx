import React from 'react';

export const Section4_Ruins = () => {
  return (
    <section className="relative w-full h-screen flex flex-col items-end justify-center px-8 md:px-24 text-right z-10 pointer-events-none">
      <div className="glass p-10 rounded-2xl max-w-xl pointer-events-auto border-r-4 border-r-ocean-light">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 drop-shadow-md">
          The Ancient Ruins
        </h2>
        <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed">
          Submerged structures holding the accumulated wisdom of past generations. 
          Here, you learn from the foundations laid before you, discovering the pillars of true knowledge.
        </p>
      </div>
    </section>
  );
};
