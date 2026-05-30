import React from 'react';

export const Section6_CTA = () => {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center px-4 text-center z-10 pointer-events-none bg-gradient-to-t from-ocean-deep/80 to-transparent">
      <div className="glass p-12 rounded-3xl pointer-events-auto border border-glow-primary/30 shadow-[0_0_40px_rgba(0,240,255,0.15)] max-w-2xl w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Emerge Transformed
        </h2>
        <p className="text-xl text-slate-200 mb-10">
          Start your own journey of discovery today and conquer the IELTS with confidence.
        </p>
        <button className="group relative px-8 py-4 bg-white text-ocean-deep font-bold text-lg rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95">
          <span className="relative z-10">Explore Now</span>
          <div className="absolute inset-0 bg-gradient-to-r from-glow-primary to-glow-secondary opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>
      </div>
    </section>
  );
};
