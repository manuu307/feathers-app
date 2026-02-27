import React from 'react';
import { motion } from 'motion/react';
import Stamp from './Stamp';

interface EnvelopeProps {
  layout: 'classic' | 'airmail' | 'royal';
  cssClass: string;
  senderAddress: string;
  receiverAddress: string;
  stamps: any[]; // Array of stamp objects
  children?: React.ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function Envelope({ 
  layout, 
  cssClass, 
  senderAddress, 
  receiverAddress, 
  stamps, 
  children,
  onClick,
  size = 'md'
}: EnvelopeProps) {
  
  const sizeClasses = {
    sm: 'w-64 h-40 text-[8px]',
    md: 'w-80 h-48 text-xs',
    lg: 'w-full max-w-2xl h-80 text-sm',
  };

  // Base styles for different layouts
  const baseStyles = "relative shadow-md flex flex-col justify-center p-6 transition-transform hover:scale-[1.01]";
  
  // Specific layout adjustments
  const layoutStyles = {
    classic: "bg-[#f0e6d2] border border-[#d7c9a8]",
    airmail: "bg-white", // Border handled by cssClass (border-image)
    royal: "bg-[#4a148c] text-[#ffd700] border-2 border-[#ffd700]",
  };

  // Combine classes. If cssClass is provided from DB, it overrides or adds to layout defaults.
  // For airmail, the DB cssClass contains the border-image logic.
  const combinedClasses = `${baseStyles} ${sizeClasses[size]} ${layout === 'airmail' ? '' : layoutStyles[layout]} ${cssClass}`;

  // Airmail stripes need specific handling if passed via style prop or class
  // The DB stores the full tailwind class string for airmail border
  
  return (
    <motion.div 
      className={combinedClasses}
      onClick={onClick}
      style={layout === 'airmail' ? {
        borderWidth: '8px',
        borderStyle: 'solid',
        borderImage: 'repeating-linear-gradient(45deg, #f44336 0, #f44336 10px, transparent 10px, transparent 20px, #2196f3 20px, #2196f3 30px, transparent 30px, transparent 40px) 1'
      } : {}}
    >
      {/* Stamps Area - Top Right */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {stamps.map((stamp, index) => (
          <div key={index} className="transform rotate-6 hover:rotate-0 transition-transform">
            <Stamp icon={stamp.icon} color={stamp.color} size={size === 'sm' ? 'sm' : 'md'} />
          </div>
        ))}
        {/* Placeholder slots if needed (passed as children or handled by parent) */}
        {children}
      </div>

      {/* Sender Address - Top Left (Small) */}
      <div className="absolute top-4 left-4 opacity-70 text-[0.7em] leading-tight">
        <p className="font-bold uppercase tracking-wider">From:</p>
        <p className="font-serif">{senderAddress}</p>
      </div>

      {/* Receiver Address - Center */}
      <div className="self-center ml-12 mt-8 p-4 border border-transparent">
        <p className="font-display uppercase tracking-widest opacity-60 text-[0.8em] mb-1">To:</p>
        <p className="font-serif text-[1.4em] italic leading-relaxed">
          {receiverAddress}
        </p>
      </div>

      {/* Postmark (Decorative) */}
      <div className="absolute top-16 right-20 opacity-30 pointer-events-none transform -rotate-12">
        <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center">
          <span className="text-[0.6em] font-display uppercase text-center leading-none">
            Owl<br/>Post<br/>Service
          </span>
        </div>
        <div className="w-24 h-0.5 bg-current absolute top-1/2 -left-4 transform -rotate-6"></div>
        <div className="w-24 h-0.5 bg-current absolute top-1/2 -left-4 transform rotate-6"></div>
      </div>
    </motion.div>
  );
}
