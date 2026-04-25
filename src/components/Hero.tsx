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
    <section ref={containerRef} className="relative flex min-h-screen flex-col justify-center px-6 md:px-16 pt-20 text-left overflow-hidden">
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
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-blue/10 via-purple-500/10 to-transparent blur-[120px]"
        />
      </div>

      {/* Background Carousel with Parallax */}
      <motion.div style={{ y: bgY, opacity: bgOpacity }} className="absolute inset-0 -z-20 bg-[#0a0a0a]">
        <AnimatePresence mode="wait">
          <motion.div
            key={customBg ? 'custom' : currentImg}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img 
              src={customBg || homeImages[currentImg]} 
              className={cn(
                "h-full w-full object-cover scale-105 transition-all duration-1000",
                customBg ? "opacity-100" : "opacity-80"
              )} 
              alt="Hero Background" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Dark Overlays for Premium Real Estate Aesthetics */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </motion.div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ y: textY, opacity: textOpacity }}
          className="z-10 max-w-3xl"
        >
          <span className="mb-4 inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-black tracking-[0.3em] uppercase text-white backdrop-blur-md shadow-lg">
            {t('hero_tag')}
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-white leading-[1.1] text-glow">
            {t('hero_title_1')} <br />
            <span className="text-brand-blue">
              {t('hero_title_2')}
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg md:text-xl font-medium text-white/90 leading-relaxed drop-shadow-md">
            {t('hero_desc')}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button onClick={onOpenQuote} className="flex items-center justify-center gap-2 rounded-full bg-brand-blue px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(0,122,255,0.4)] transition-all hover:bg-brand-blue/90 hover:scale-105 active:scale-95 text-sm uppercase tracking-widest">
              <FileText size={18} /> {t('request_quote')}
            </button>
            <button className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40 text-sm uppercase tracking-widest">
              {t('explore_btn')} <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Solid White Bottom Pill - Floating Stats */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 z-20 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full max-w-5xl bg-white rounded-[40px] md:rounded-full p-6 md:px-12 md:py-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12"
        >
          {[
            { label: 'Happy Clients', value: '15k+' },
            { label: 'Cyber Speed', value: '1Gbps' },
            { label: 'Awards Win', value: '24' },
            { label: 'Years Experience', value: '12' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto relative">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">{stat.label}</span>
               <span className="text-3xl font-black tracking-tighter text-[#1D1D1F]">{stat.value}</span>
               {i !== 3 && <div className="hidden md:block absolute right-[-2.5rem] top-1/2 -translate-y-1/2 w-[1px] h-10 bg-black/5" />}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
