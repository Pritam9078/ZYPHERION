import React from 'react';
import { motion } from 'framer-motion';

const ThreeDBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 flex items-center justify-center [perspective:1200px]">
        {/* Main Rotating 3D Object - Wireframe Diamond */}
        <motion.div
          animate={{
            rotateY: [0, 360],
            rotateX: [0, 180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-[500px] h-[500px] opacity-20"
        >
          {/* Faces of the Octahedron-like structure */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                transform: `rotateY(${i * 45}deg) rotateX(45deg) translateZ(150px)`,
                background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.08), transparent)',
              }}
            />
          ))}
          
          {/* Internal Core Pulsing */}
          <motion.div
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 m-auto w-32 h-32 bg-blue-400 blur-[80px] rounded-full"
          />
        </motion.div>

        {/* Floating 3D Data Bits */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`bit-${i}`}
            initial={{ 
              x: Math.random() * 1000 - 500, 
              y: Math.random() * 1000 - 500, 
              z: Math.random() * -500 
            }}
            animate={{
              y: [0, -100, 0],
              rotateZ: [0, 360],
              z: [Math.random() * -500, Math.random() * 200, Math.random() * -500],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"
          />
        ))}



        {/* Ambient background light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
      </div>
    </div>
  );
};

export default ThreeDBackground;
