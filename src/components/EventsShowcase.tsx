import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, ChevronRight } from 'lucide-react';

export default function EventsShowcase() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('business_events')
        .select('*')
        .order('date', { ascending: true });
      
      if (data) {
        const upcomingEvents = data.filter(ev => new Date(ev.date) >= new Date(new Date().setHours(0,0,0,0)));
        setEvents(upcomingEvents);
      }
      setLoading(false);
    };

    fetchEvents();

    const channel = supabase
      .channel('public:business_events_public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'business_events' }, fetchEvents)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading || events.length === 0) return null;

  return (
    <section className="relative w-full bg-[#fbfbfd] px-4 py-24 md:py-32 overflow-hidden border-t border-black/5">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-block rounded-full border border-black/5 bg-black/5 px-4 py-1 text-[10px] md:text-xs font-semibold tracking-widest uppercase text-black/40 backdrop-blur-md"
            >
              What's Next
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1D1D1F]"
            >
              Upcoming <span className="bg-gradient-to-r from-brand-blue to-purple-600 bg-clip-text text-transparent">Events</span>
            </motion.h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {events.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card flex flex-col overflow-hidden bg-white/80 backdrop-blur-xl border border-black/5 rounded-[32px] transition-all hover:shadow-2xl hover:shadow-brand-blue/10 hover:-translate-y-2 group"
            >
              <div className="relative h-60 md:h-72 w-full overflow-hidden shrink-0 bg-black/5">
                {ev.image ? (
                  <img 
                    src={ev.image} 
                    alt={ev.title} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Calendar className="text-black/20" size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-4 py-2 border border-black/5 shadow-sm">
                  <Calendar size={14} className="text-brand-blue" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1D1D1F]">
                    {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col flex-grow p-6 md:p-8">
                <h3 className="mb-3 text-xl md:text-2xl font-bold tracking-tight text-[#1D1D1F] line-clamp-2 break-words">
                  {ev.title}
                </h3>
                <p className="mb-6 text-sm text-[#1D1D1F]/60 line-clamp-3 leading-relaxed flex-grow break-words">
                  {ev.desc}
                </p>
                
                <button 
                  onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-black/5 hover:bg-brand-blue border border-black/5 hover:border-brand-blue px-6 py-4 font-bold text-[#1D1D1F] hover:text-white transition-all text-sm group/btn"
                >
                  Inquire Now
                  <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
