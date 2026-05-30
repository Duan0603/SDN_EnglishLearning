import React from 'react';

export const Section3_Forest = () => {
  return (
    <section className="relative w-full h-screen flex flex-col items-start justify-center px-8 md:px-24 text-left z-10 pointer-events-none">
      <div className="glass p-10 rounded-2xl max-w-xl pointer-events-auto border-l-4 border-l-glow-secondary">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 drop-shadow-md">
          The Forest Of Discovery
        </h2>
        <ul className="space-y-4 text-lg md:text-xl text-slate-200 font-light">
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-glow-secondary shadow-[0_0_10px_var(--color-glow-secondary)]"></span>
            Uncover new skills
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-glow-secondary shadow-[0_0_10px_var(--color-glow-secondary)]"></span>
            Master complex technologies
          </li>
          <li className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-glow-secondary shadow-[0_0_10px_var(--color-glow-secondary)]"></span>
            Cultivate brilliant ideas
          </li>
        </ul>
      </div>
    </section>
  );
};
