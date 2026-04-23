import { motion } from 'motion/react';
import { Zap, Crown, Droplets, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

const items = [
  { id: 'cyber', title: 'Cyber Services', icon: Zap, color: 'text-blue-500' },
  { id: 'barber', title: 'Precision Barber', icon: Crown, color: 'text-amber-500' },
  { id: 'carwash', title: 'Elite Carwash', icon: Droplets, color: 'text-indigo-500' },
  { id: 'laundry', title: 'Premium Laundry', icon: Sparkles, color: 'text-teal-500' }
];

export default function ServicesSummary() {
  const { t } = useLanguage();

  return (
    <section className="py-12 px-4 bg-white/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-6 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F]">
              Explore Our <span className="text-black/40">Services</span>
            </h2>
            <p className="mt-4 text-lg text-black/50">
              A comprehensive suite of premium solutions from cybersecurity to artisanal grooming.
            </p>
          </div>
          <Link 
            to="/services" 
            className="group flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3 font-bold text-white shadow-xl hover:scale-105 transition-transform"
          >
            {t('nav_services')} 
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 flex flex-col items-center text-center group hover:border-brand-blue/30 transition-all border-white/60"
            >
              <div className={cn("h-16 w-16 rounded-2xl bg-black/5 flex items-center justify-center mb-6 transition-transform group-hover:scale-110", item.color)}>
                <item.icon size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#1D1D1F]">{item.title}</h3>
              <div className="mt-4 h-1 w-8 bg-black/5 rounded-full group-hover:bg-brand-blue transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
