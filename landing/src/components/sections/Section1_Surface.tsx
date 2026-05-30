import React from 'react';
import { motion } from 'framer-motion';

export const Section1_Surface = () => {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center pt-20 px-4 text-center z-10 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="pointer-events-auto"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-lg">
          Every Great Discovery <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-light to-glow-primary">
            Begins With Curiosity
          </span>
        </h1>
        <p className="text-lg md:text-2xl text-slate-200 max-w-2xl mx-auto font-light drop-shadow-md">
          Dive into the Ocean of Knowledge. The deeper you go, the more you uncover.
        </p>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <p className="text-sm uppercase tracking-widest mb-2 opacity-70">Scroll to Dive</p>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent"></div>
      </motion.div>
    </section>
  );
};
