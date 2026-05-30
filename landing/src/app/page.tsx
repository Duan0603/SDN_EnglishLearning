"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scene } from "@/components/canvas/Scene";
import { Section1_Surface } from "@/components/sections/Section1_Surface";
import { Section2_EnteringDepths } from "@/components/sections/Section2_EnteringDepths";
import { Section3_Forest } from "@/components/sections/Section3_Forest";
import { Section4_Ruins } from "@/components/sections/Section4_Ruins";
import { Section5_Treasure } from "@/components/sections/Section5_Treasure";
import { Section6_CTA } from "@/components/sections/Section6_CTA";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Setup GSAP fades for HTML sections
    const sections = gsap.utils.toArray(".story-section");
    
    sections.forEach((section: any, i) => {
      // First section is already visible, others fade in
      if (i > 0) {
        gsap.fromTo(
          section,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "top 30%",
              scrub: 1,
            },
          }
        );
      }
      
      // All sections fade out except the last one
      if (i < sections.length - 1) {
        gsap.to(section, {
          opacity: 0,
          y: -50,
          scrollTrigger: {
            trigger: section,
            start: "bottom 50%",
            end: "bottom 10%",
            scrub: 1,
          },
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main className="relative w-full">
      <Scene />
      
      <div id="scroll-container" ref={containerRef} className="relative z-10 w-full flex flex-col">
        {/* We use extra height/margin to allow for slow scrolling through the 3D space */}
        <div className="story-section min-h-[150vh] flex flex-col justify-start">
          <Section1_Surface />
        </div>
        
        <div className="story-section min-h-[150vh] flex flex-col justify-center">
          <Section2_EnteringDepths />
        </div>
        
        <div className="story-section min-h-[150vh] flex flex-col justify-center">
          <Section3_Forest />
        </div>
        
        <div className="story-section min-h-[150vh] flex flex-col justify-center">
          <Section4_Ruins />
        </div>
        
        <div className="story-section min-h-[150vh] flex flex-col justify-center">
          <Section5_Treasure />
        </div>
        
        <div className="story-section min-h-[100vh] flex flex-col justify-end">
          <Section6_CTA />
        </div>
      </div>
    </main>
  );
}
