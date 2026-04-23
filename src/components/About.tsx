import { motion } from 'motion/react';
import { Shield, Zap, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  return (
    <section id="about" className="py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        <div className="w-full lg:w-1/2 relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-2 aspect-square relative z-10"
          >
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
              className="w-full h-full object-cover rounded-[30px]" 
              alt="The Junction Hub"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 h-40 w-40 bg-brand-blue/30 blur-[60px]" />
          <div className="absolute -bottom-10 -right-10 h-60 w-60 bg-violet-500/20 blur-[80px]" />
        </div>

        <div className="w-full lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-[#1D1D1F]">
              {t('about_title_1')} <br />
              <span className="text-black/40">{t('about_title_2')}</span>
            </h2>
            <p className="text-lg text-black/60 mb-10">
              {t('about_desc')}
            </p>

            <div className="space-y-8">
              {[
                { icon: Shield, label: 'Unmatched Security', desc: 'Secure digital tunnels and military-grade car care.' },
                { icon: Zap, label: 'Speed & Efficiency', desc: 'The fastest uplink and the quickest high-quality cuts.' },
                { icon: Heart, label: 'Customer First', desc: 'Personalized care at every touchpoint of our business.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-black/5 border border-black/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue/20 transition-all">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#1D1D1F]">{item.label}</h4>
                    <p className="text-black/40 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
