"use client";

import { useEffect, useRef, useState } from "react";
import { animate, svg } from "animejs";
import { tracks, Track } from "./data/tracks";

export default function Home() {
  const [selectedTrack, setSelectedTrack] = useState<Track>(tracks[0]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [dynamicViewBox, setDynamicViewBox] = useState('');
  const [carScale, setCarScale] = useState(1);
  const pathRef = useRef<SVGPathElement>(null);
  const carRef = useRef<SVGGElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!pathRef.current || !carRef.current) return;

    // 1. Calculate dynamic viewBox to center and fit the track
    const bbox = pathRef.current.getBBox();
    const padding = Math.max(bbox.width, bbox.height) * 0.1; // 10% padding
    const newViewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;
    setDynamicViewBox(newViewBox);

    // 2. Normalize car scale
    // We want the car to be roughly the same visual size regardless of the track's coordinate system scale
    // Reference: a "standard" track might have a dimension of 1000 units
    const referenceDimension = 1000;
    const currentMaxDim = Math.max(bbox.width, bbox.height);
    const newScale = currentMaxDim / referenceDimension;
    setCarScale(newScale);

    // Reset animations if switching tracks
    if (animationRef.current) {
      animationRef.current.pause();
    }

    // Initialize the line drawing and car motion
    const motionPath = svg.createMotionPath(pathRef.current);
    
    // Animate the car along the path
    animationRef.current = animate(carRef.current, {
      ...motionPath,
      duration: 8000,
      loop: true,
      ease: "linear",
      autoplay: isAnimating
    });

    // Subtle path drawing effect on mount
    animate(svg.createDrawable(pathRef.current), {
      draw: "0 1",
      duration: 2000,
      ease: "easeInOutQuart",
    });

    return () => {
      if (animationRef.current) animationRef.current.pause();
    };
  }, [selectedTrack]);

  useEffect(() => {
    if (animationRef.current) {
      if (isAnimating) animationRef.current.play();
      else animationRef.current.pause();
    }
  }, [isAnimating]);

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
      {/* Background radial gradient for depth */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(220,38,38,0.05)_0%,_transparent_50%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:flex lg:gap-16">
        
        {/* Left Section: Circuit Visualization (Sticky on Desktop) */}
        <section className="lg:flex-1 lg:h-screen lg:sticky lg:top-0 flex flex-col justify-center py-12 lg:py-0">
          <div className="flex items-end justify-between border-b border-white/10 pb-6 mb-8">
            <div>
              <h2 className="text-red-600 font-black tracking-tighter text-sm uppercase mb-1">F1 2026 Calendar</h2>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none uppercase italic">
                {selectedTrack.name.split(' ').map((word: string, i: number) => (
                  <span key={i} className={i === 0 ? "text-white" : "text-white/40"}>
                    {word}{" "}
                  </span>
                ))}
              </h1>
              <p className="text-white/40 mt-4 font-medium tracking-wide uppercase text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                {selectedTrack.location}
              </p>
            </div>
            <div className="hidden md:flex gap-4">
               <button 
                onClick={() => setIsAnimating(!isAnimating)}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors group"
               >
                 {isAnimating ? (
                   <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white group-hover:scale-110 transition-transform"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                 ) : (
                   <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white group-hover:scale-110 transition-transform"><path d="M8 5v14l11-7z"/></svg>
                 )}
               </button>
            </div>
          </div>

          <div className="aspect-square md:aspect-[16/10] bg-white/[0.02] border border-white/10 rounded-3xl relative overflow-hidden group">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            <div className="absolute inset-0 flex items-center justify-center p-12 md:p-20">
              <svg 
                viewBox={dynamicViewBox} 
                className="w-full h-full drop-shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all duration-700 ease-in-out"
                fill="none"
              >
                {/* Track Glow */}
                <path
                  d={selectedTrack.path}
                  stroke="rgba(220,38,38,0.1)"
                  strokeWidth={20 * carScale}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Main Track Path */}
                <path
                  ref={pathRef}
                  id="track-path"
                  d={selectedTrack.path}
                  stroke="white"
                  strokeWidth={4 * carScale}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-20"
                />

                {/* Animated Car */}
                <g ref={carRef} style={{ pointerEvents: 'none' }}>
                  <g transform={`scale(${carScale})`}>
                    {/* Car Glow */}
                    <circle r="8" fill="rgba(220,38,38,0.4)" className="animate-pulse" />
                    {/* Car Body */}
                    <path 
                      d="M-6,-4 L8,0 L-6,4 Z" 
                      fill="#dc2626" 
                      stroke="white" 
                      strokeWidth="1.5"
                    />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </section>

        {/* Right Section: Sidebar (Independently scrolling) */}
        <aside className="w-full lg:w-[400px] py-12 lg:py-20 flex flex-col gap-10">
          
          {/* 1. Track Selection - Fixed height to avoid jumps */}
          <div className="flex flex-col h-[480px] shrink-0">
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-6">Select Circuit</h3>
            <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-scrollbar">
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track)}
                  className={`
                    w-full group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-300
                    ${selectedTrack.id === track.id 
                      ? "bg-white/5 border-white/20 ring-1 ring-white/10 shadow-2xl" 
                      : "bg-transparent border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                    }
                  `}
                >
                   <div className="flex flex-col items-start gap-1">
                    <span className={`text-sm font-bold tracking-tight uppercase transition-colors ${selectedTrack.id === track.id ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>
                      {track.name}
                    </span>
                    <span className="text-[10px] font-medium text-white/20 uppercase tracking-wider italic">
                      {track.location.split(',')[1] || track.location}
                    </span>
                  </div>
                  {selectedTrack.id === track.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_10px_#dc2626]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Random Facts - Dynamic height, naturally flows below */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden transition-all duration-500">
             <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">Random Facts</h3>
             <div className="text-sm text-white/60 leading-relaxed font-medium">
               <ul className="list-disc list-inside space-y-3">
                 {selectedTrack.facts?.map((fact: string) => (
                   <li key={fact} className="pl-1">
                     <span className="relative -left-2">{" " + fact}</span>
                   </li>
                 ))}
               </ul>
             </div>
             <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-white/5">
                {selectedTrack.tags?.map((tag: string) => (
                  <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-white/40">
                    {tag}
                  </span>
                ))}
             </div>
          </div>
          
          {/* Footer Decoration (Local within sidebar) */}
          <div className="mt-auto pt-10 opacity-20 flex justify-between items-center text-[10px] font-mono tracking-tighter">
             <div>DATA_STREAM :: FORMULA_SVG_READY CSM EL ND</div>
             <div className="uppercase">AG-F1-ENGINE</div>
          </div>
        </aside>

      </div>
    </main>
  );
}
