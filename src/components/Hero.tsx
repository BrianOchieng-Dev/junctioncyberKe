import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ChevronRight, FileText, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const homeImages = [
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1552933061-90320eecd1f1?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1545173168-9f1947eebb9f?auto=format&fit=crop&q=80&w=1600'
];

interface HeroProps {
  onOpenQuote: () => void;
  isAuthenticated: boolean;
}

export default function Hero({ onOpenQuote, isAuthenticated }: HeroProps) {
  const { t } = useLanguage();
  const [currentImg, setCurrentImg] = useState(0);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Subtler parallax for background image
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  // Slight parallax and fade for the text content
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50px"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const fetchHeroBg = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_bg')
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching hero background:', error);
          return;
        }
        
        if (data?.value) {
          console.log('Successfully loaded custom background:', data.value);
          setCustomBg(data.value);
        } else {
          console.log('No custom background found in site_settings.');
        }
      } catch (err) {
        console.warn('Hero background fetch failed:', err);
      }
    };
    fetchHeroBg();
 
    // Subscribe to realtime updates for hero background
    const channel = supabase
      .channel('hero_bg_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings',
          filter: 'key=eq.hero_bg'
        },
        (payload) => {
          console.log('Realtime background update:', payload.new.value);
          setCustomBg(payload.new.value);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'site_settings',
          filter: 'key=eq.hero_bg'
        },
        (payload) => {
          setCustomBg(payload.new.value);
        }
      )
      .subscribe();

    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % homeImages.length);
    }, 6000);

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section ref={containerRef} style={{ position: 'relative' }} className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-10 text-center overflow-hidden">
      {/* Dynamic Mesh Animation */}
      <div className="absolute inset-0 -z-30">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-blue/5 via-purple-500/5 to-transparent blur-[120px]"
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            x: [50, 0, 50],
            y: [30, 0, 30],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-indigo-500/5 via-brand-blue/5 to-transparent blur-[120px]"
        />
      </div>

      {/* Background Carousel with Parallax */}
      <motion.div style={{ y: bgY, opacity: bgOpacity }} className="absolute inset-0 -z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={customBg ? 'custom' : currentImg}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img 
              src={customBg || homeImages[currentImg]} 
              className={cn(
                "h-full w-full object-cover scale-110 transition-all duration-1000",
                customBg ? "opacity-60" : "grayscale opacity-25"
              )} 
              alt="Hero Background" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>
        {/* Glass Overlays for White Aesthetics */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b from-[#fbfbfd] via-[#fbfbfd]/30 to-[#fbfbfd]",
          customBg ? "opacity-40" : "opacity-80"
        )} />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </motion.div>

      {/* Background Refraction Circle */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/10 blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ y: textY, opacity: textOpacity }}
        className="z-10"
      >
        <span className="mb-2 inline-block rounded-full border border-black/5 bg-black/5 px-4 py-1 text-[10px] md:text-xs font-semibold tracking-widest uppercase text-black/40 backdrop-blur-md">
          {t('hero_tag')}
        </span>
        <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-[#1D1D1F] lg:leading-[1.1] px-2">
          {t('hero_title_1')} <br />
          <span className="bg-gradient-to-r from-brand-blue to-purple-600 bg-clip-text text-transparent text-glow">
            {t('hero_title_2')}
          </span>
        </h1>
        <p className="mx-auto mt-6 md:mt-8 max-w-2xl text-base md:text-lg lg:text-xl text-[#1D1D1F]/60 px-4">
          {t('hero_desc')}
        </p>

        <div className="mt-4 md:mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row px-4">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#1D1D1F] px-8 py-4 font-bold text-white transition-all hover:bg-brand-blue group">
            {t('explore_btn')}
            <ChevronRight className="transition-transform group-hover:translate-x-1" size={20} />
          </button>
          
          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <button 
              onClick={onOpenQuote}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full border border-black/10 bg-black/5 px-6 py-4 font-bold text-[#1D1D1F] backdrop-blur-md transition-all hover:bg-black/10 text-sm whitespace-nowrap"
            >
              <FileText size={18} /> {t('request_quote')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Floating Glass Stats */}
      <div className="mt-8 md:mt-12 grid w-full max-w-5xl grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 px-4 z-10">
        {[
          { label: 'Happy Clients', value: '15k+' },
          { label: 'Cyber Speed', value: '1Gbps' },
          { label: 'Awards Win', value: '24' },
          { label: 'Years Experience', value: '12' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="glass-card flex flex-col items-center justify-center p-6 text-center border-white/60 shadow-lg"
          >
            <span className="text-2xl font-bold text-brand-blue">{stat.value}</span>
            <span className="text-xs font-bold text-[#1D1D1F]/40">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
