"use client";

import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP Plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Particles = () => {
  const count = 2000;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100;
  }
  
  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      ref.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#00f0ff" transparent opacity={0.4} sizeAttenuation={true} />
    </points>
  );
};

const CoralForest = () => {
  return (
    <group position={[0, -50, -10]}>
      {/* Some glowing coral-like shapes */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <mesh 
            position={[
              (Math.random() - 0.5) * 40,
              Math.random() * 10,
              (Math.random() - 0.5) * 40
            ]}
          >
            <cylinderGeometry args={[0.1, 0.5, Math.random() * 5 + 2, 8]} />
            <meshStandardMaterial 
              color="#00ffa3" 
              emissive="#00ffa3" 
              emissiveIntensity={0.5} 
              transparent 
              opacity={0.8} 
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const Ruins = () => {
  return (
    <group position={[0, -100, -20]}>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 50
          ]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          <boxGeometry args={[Math.random() * 5 + 2, Math.random() * 10 + 5, Math.random() * 5 + 2]} />
          <meshStandardMaterial color="#1a3b5c" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

const Treasure = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.rotation.z += 0.005;
    }
  });

  return (
    <group position={[0, -150, -15]}>
      <mesh ref={ref}>
        <octahedronGeometry args={[4, 0]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffd700" 
          emissiveIntensity={1} 
          wireframe 
        />
      </mesh>
      <pointLight color="#ffd700" intensity={10} distance={50} />
    </group>
  );
};

const CameraController = () => {
  const cameraGroupRef = useRef<THREE.Group>(null);
  
  useLayoutEffect(() => {
    if (!cameraGroupRef.current) return;
    
    // We create a master timeline that spans the height of the scroll container
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
      }
    });

    // Dive down to depths
    tl.to(cameraGroupRef.current.position, {
      y: -150,
      ease: "none"
    }, 0);

    // Add some rotation to camera for a meandering dive effect
    tl.to(cameraGroupRef.current.rotation, {
      y: Math.PI * 0.2,
      x: -Math.PI * 0.1,
      ease: "sine.inOut"
    }, 0);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <group ref={cameraGroupRef}>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#00f0ff" distance={30} />
    </group>
  );
};

export const Scene = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none bg-ocean-deep">
      <Canvas>
        <fog attach="fog" args={['#000c14', 10, 80]} />
        <ambientLight intensity={0.1} color="#004c6d" />
        <directionalLight position={[10, 20, 10]} intensity={1} color="#006994" />
        
        <CameraController />
        <Particles />
        <CoralForest />
        <Ruins />
        <Treasure />
      </Canvas>
    </div>
  );
};
