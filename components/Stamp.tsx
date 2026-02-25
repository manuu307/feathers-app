'use client';

import React from 'react';
import { TreePine, Cloud, Sun, Moon, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Tree: TreePine,
  Cloud: Cloud,
  Sun: Sun,
  Moon: Moon,
};

interface StampProps {
  icon: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Stamp({ icon, color, size = 'md', className = '' }: StampProps) {
  const Icon = iconMap[icon] || TreePine;
  
  const sizeClasses = {
    sm: 'w-8 h-10',
    md: 'w-12 h-14',
    lg: 'w-16 h-20',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div 
      className={`relative flex items-center justify-center bg-white border-2 border-dashed rounded-sm shadow-sm ${sizeClasses[size]} ${className}`}
      style={{ borderColor: color }}
    >
      {/* Perforated edge effect using CSS mask or just a border */}
      <div className="absolute inset-0 border-4 border-white opacity-50 pointer-events-none" />
      <Icon className={`${iconSizes[size]}`} style={{ color }} strokeWidth={1.5} />
      
      {/* Stamp "cancellation" mark (optional) */}
      <div className="absolute -top-1 -right-1 w-4 h-4 border border-black/10 rounded-full opacity-20 rotate-12" />
    </div>
  );
}
