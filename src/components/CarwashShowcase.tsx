import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function CarwashShowcase() {
  const [items, setItems] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      const { data } = await supabase.from('carwash_showcase').select('*').order('created_at', { ascending: false });
      if (data) setItems(data);
      setLoading(false);
    }
    fetchItems();
  }, []);

  if (loading || items.length === 0) return null;

  const next = () => setIndex((index + 1) % items.length);
  const prev = () => setIndex((index - 1 + items.length) % items.length);

  return (
    <section className="py-12 px-4 bg-white/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#1D1D1F]">
              The <span className="text-brand-blue">Magic</span> Touch
            </h2>
            <p className="text-black/40 font-bold text-xs tracking-[0.2em] uppercase mt-2">Before & After Transformations</p>
          </div>
          
          <div className="flex gap-2">
            <button onClick={prev} className="h-12 w-12 rounded-full bg-white border border-black/5 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="h-12 w-12 rounded-full bg-white border border-black/5 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[40px] overflow-hidden glass-card border-none shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={items[index].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 grid grid-cols-2"
            >
              <div className="relative overflow-hidden group">
                <img src={items[index].before_url} className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0" alt="Before" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-8 left-8">
                  <span className="px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">Before</span>
                </div>
              </div>
              
              <div className="relative overflow-hidden group border-l-4 border-white">
                <img src={items[index].after_url} className="h-full w-full object-cover transition-all duration-700" alt="After" />
                <div className="absolute inset-0 bg-brand-blue/5" />
                <div className="absolute bottom-8 right-8">
                  <span className="px-4 py-2 bg-brand-blue backdrop-blur-xl rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-xl">After</span>
                </div>
                <div className="absolute top-8 right-8 h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 animate-pulse">
                   <Sparkles size={24} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 hidden md:block">
             <div className="h-20 w-20 rounded-full bg-white shadow-2xl flex items-center justify-center text-[#1D1D1F] font-black text-xs tracking-tighter border-4 border-brand-blue/10">
                VS
             </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between px-8">
           <p className="text-xl font-bold text-[#1D1D1F]">{items[index].car_model}</p>
           <div className="flex gap-1">
              {items.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === index ? 'w-8 bg-brand-blue' : 'w-2 bg-black/10'}`} />
              ))}
           </div>
        </div>
      </div>
    </section>
  );
}
