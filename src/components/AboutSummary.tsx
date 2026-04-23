import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function AboutSummary() {
  const { t } = useLanguage();

  return (
    <section className="py-12 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-1/2 relative">
          <div className="glass-card p-2 aspect-video overflow-hidden border-white/60">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
              className="w-full h-full object-cover rounded-[30px]" 
              alt="The Junction Hub"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -top-6 -right-6 h-24 w-24 glass-card bg-brand-blue/10 backdrop-blur-3xl flex items-center justify-center text-brand-blue font-black text-2xl border-white/40">
             12Y
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] mb-6">
            Technology Meets <br />
            <span className="text-black/40">Artisanal Skill.</span>
          </h2>
          <p className="text-lg text-black/60 mb-5 leading-relaxed max-w-xl">
            Established as a curation of excellence, The Junction Cyber provides an ecosystem where high-performance digital services flourish alongside traditional precision grooming and master-class detailing.
          </p>
          <Link 
            to="/about" 
            className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-8 py-4 font-bold text-[#1D1D1F] backdrop-blur-md transition-all hover:bg-black/10"
          >
            {t('nav_about')} 
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
