'use client';

import { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Video, Key } from 'lucide-react';

export default function VideoBackground() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (typeof window !== 'undefined' && window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (typeof window !== 'undefined' && window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const generateCinematicVideo = async () => {
    setIsGenerating(true);
    setStatus('Inscribing the realm into reality...');
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''; // Fallback, but Veo needs the injected one
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || apiKey });
      
      const prompt = "Cinematic aerial view of a high-fantasy medieval realm with a distant castle, rolling green hills, a turning windmill, and a clear blue sky with drifting clouds, MMORPG aesthetic, highly detailed, epic scale, soft sunlight.";
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      setStatus('The winds are shaping the landscape...');
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        setStatus(prev => {
          const messages = [
            'The sun is rising over the distant towers...',
            'Birds are taking flight across the valley...',
            'The clouds are gathering their form...',
            'Finalizing the magical weave...'
          ];
          return messages[Math.floor(Math.random() * messages.length)];
        });
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.API_KEY || apiKey,
          },
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        localStorage.setItem('feathers_background_video', url);
      }
    } catch (error: any) {
      console.error('Video generation failed:', error);
      if (error.message?.includes('Requested entity was not found')) {
        setHasKey(false);
      }
      setStatus('The ritual was interrupted. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (videoUrl) {
    return (
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    );
  }

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center bg-black/20">
      <AnimatePresence mode="wait">
        {!hasKey ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center space-y-4 p-8 game-panel border-white/10"
          >
            <Key className="w-12 h-12 text-feathers-accent animate-pulse" />
            <h3 className="text-xl font-display text-white uppercase italic">Magical Key Required</h3>
            <p className="text-white/60 font-serif text-sm text-center max-w-xs">
              To manifest the cinematic realm, you must provide a magical key from your Google Cloud project.
            </p>
            <button 
              onClick={handleSelectKey}
              className="game-button px-8 py-3 text-white uppercase tracking-widest text-xs"
            >
              Select Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="text-[10px] text-white/30 underline hover:text-white/50"
            >
              Learn about billing
            </a>
          </motion.div>
        ) : isGenerating ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center space-y-6"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-feathers-accent animate-spin" />
              <div className="absolute inset-0 blur-xl bg-feathers-accent/20 rounded-full" />
            </div>
            <p className="text-white font-display uppercase italic tracking-[0.2em] text-sm animate-pulse">
              {status}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center space-y-4"
          >
            <button 
              onClick={generateCinematicVideo}
              className="game-button px-10 py-4 text-white font-display tracking-[0.3em] uppercase text-sm group flex items-center"
            >
              <Video className="w-5 h-5 mr-3 group-hover:text-feathers-accent transition-colors" />
              Manifest Cinematic Realm
            </button>
            <p className="text-white/40 font-serif text-[10px] uppercase tracking-widest">
              This ritual takes a few moments to complete
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
