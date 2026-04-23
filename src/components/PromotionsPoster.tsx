import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Megaphone, Clock, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

const mockPromotions = [
  {
    id: 1,
    title: 'Weekend Cyber Grind',
    offer: '50% Off Gaming',
    desc: 'Unleash the gamer in you every Saturday and Sunday.',
    img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200',
    tag: 'Cyber'
  },
  {
    id: 2,
    title: 'Elite Shine Special',
    offer: 'Free Interior Clean',
    desc: 'Book a full ceramic detail and get interior restoration on us.',
    img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=1200',
    tag: 'Carwash'
  }
];

export default function PromotionsPoster() {
  const [index, setIndex] = useState(0);
  const [promotions, setPromotions] = useState<any[]>(mockPromotions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const formattedPromotions = data.map((p, i) => ({ ...p, id: `db-${p.id || i}` }));
          setPromotions([...formattedPromotions, ...mockPromotions.map(p => ({ ...p, id: `mock-${p.id}` }))]);
        }
      } catch (err) {
        console.error('Failed to fetch promotions');
      } finally {
        setLoading(false);
      }
    }
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (promotions.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % promotions.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [promotions]);

  if (loading || promotions.length === 0) return null;

  return (
    <section className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <Megaphone size={16} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-black/40">Recent Updates & Promotions</span>
        </div>

        <div className="relative h-[400px] md:h-[500px] rounded-[40px] overflow-hidden glass-card border-none group">
          <AnimatePresence mode="wait">
            <motion.div
              key={promotions[index].id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={promotions[index].img} 
                className="h-full w-full object-cover grayscale opacity-50 transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-100" 
                alt={promotions[index].title} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute inset-0 p-12 flex flex-col justify-end">
                 <motion.div
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.5 }}
                 >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                        {promotions[index].tag}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/60">
                        <Clock size={12} /> Limited Time Offer
                      </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
                      {promotions[index].title} <br/>
                      <span className="text-brand-blue">{promotions[index].offer}</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-xl mb-8">
                       {promotions[index].desc}
                    </p>
                    <button className="flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-brand-blue transition-transform active:scale-95 group/btn">
                       Claim Offer <Tag size={20} className="transition-transform group-hover/btn:rotate-12" />
                    </button>
                 </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="absolute bottom-12 right-12 flex gap-2">
            {promotions.map((_, i) => (
              <button 
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-brand-blue' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
