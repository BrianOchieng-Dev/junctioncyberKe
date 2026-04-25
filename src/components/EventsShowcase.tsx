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
        // Filter out past events
        const upcomingEvents = data.filter(ev => new Date(ev.date) >= new Date(new Date().setHours(0,0,0,0)));
        setEvents(upcomingEvents);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  if (loading || events.length === 0) return null;

  return (
    <section className="relative w-full bg-[#0a0a0a] px-4 py-24 md:py-32 overflow-hidden">
      {/* Background Subtle Mesh */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-blue/5 to-purple-900/5 blur-3xl opacity-50" />
      
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-black tracking-[0.3em] uppercase text-white backdrop-blur-md"
            >
              What's Next
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tighter text-white"
            >
              Upcoming <span className="text-brand-blue">Events</span>
            </motion.h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col overflow-hidden rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20"
            >
              <div className="relative h-64 md:h-72 w-full overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-transparent z-10" />
                <img 
                  src={ev.image} 
                  alt={ev.title} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-4 py-2 border border-white/10">
                  <Calendar size={14} className="text-brand-blue" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              
              <div className="relative flex flex-col flex-grow p-8 pt-6 z-20 -mt-8">
                <h3 className="mb-3 font-heading text-xl font-black uppercase tracking-tight text-white line-clamp-2">
                  {ev.title}
                </h3>
                <p className="mb-6 text-sm font-medium text-white/50 line-clamp-3 leading-relaxed flex-grow">
                  {ev.desc}
                </p>
                <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Junction Exclusive</span>
                  <div className="h-8 w-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
