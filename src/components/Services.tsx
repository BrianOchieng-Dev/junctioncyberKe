import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Scissors, Sparkles, Shirt, ArrowUpRight, Calendar, Download, Ticket as TicketIcon, Zap, Crown, Droplets, Waves } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

const categories = [
  { id: 'cyber', title: 'Cyber Services', icon: Zap, color: 'from-blue-500 to-cyan-400' },
  { id: 'barber', title: 'Precision Barber', icon: Crown, color: 'from-amber-500 to-orange-400' },
  { id: 'carwash', title: 'Elite Carwash', icon: Droplets, color: 'from-indigo-500 to-purple-400' },
  { id: 'laundry', title: 'Premium Laundry', icon: Sparkles, color: 'from-teal-500 to-emerald-400' }
];

const serviceDetails = {
  cyber: [
    { title: 'Printing & Photocopying', price: 'FROM KES 10', desc: 'Enjoy crisp, smudgeless prints with rapid turnaround times for both bulk and single-page requests using our high-quality monochrome and color document reproduction.' },
    { title: 'Lamination & Binding', price: 'FROM KES 50', desc: 'Secure and professional finishing. Protect your certificates and essential reports from moisture, tearing, and aging with our durable, crystal-clear lamination.' },
    { title: 'Stationery & Supplies', price: 'VARIED', desc: 'Elevate your workspace with carefully curated tools. We provide premium pens, paper, and essential office accessories designed for precision.' },
    { title: 'Typesetting & Designing', price: 'FROM KES 200', desc: 'Ensure flawless presentation with our layout specialists. We handle professional data entry, advanced document formatting, and complex typesetting.' },
    { title: 'Web Design & Hosting', price: 'FROM KES 15K', desc: 'Bespoke digital architecture for your personal or business brand. We build fast, responsive, and secure websites optimized to convert visitors into loyal clients.' },
    { title: 'Executive Soft Drinks', price: 'FROM KES 100', desc: 'Stay hydrated and refreshed with chilled, high-quality beverages on demand. A premium refreshment selection to enjoy while you wait or work in our lounge.' }
  ],
  barber: [
    { title: 'Executive Haircut', price: 'FROM KES 1,000', desc: 'Experience sharp, meticulously crafted fades that complement your facial structure. Master-level precision cutting finalized with an exclusive hot towel finish.' },
    { title: 'Therapeutic Massage', price: 'FROM KES 2,500', desc: 'Relieve accumulated stress and muscle tension with our targeted deep-tissue techniques. Choose from full body or focused relaxation sessions led by certified professionals.' },
    { title: 'Luxury Dye Application', price: 'FROM KES 1,500', desc: 'Achieve a natural-looking, vibrant finish using top-tier, scalp-friendly organic dyes. We specialize in premium hair color enhancement and flawless gray coverage.' },
    { title: 'Master Gel & Styling', price: 'FROM KES 500', desc: 'Lock in your signature look all day. We use flake-free, high-hold professional products for advanced gel application ensuring long-lasting, defined aesthetics.' }
  ],
  carwash: [
    { title: 'Pure Body Wash', price: 'FROM KES 500', desc: 'Protect your clear-coat from micro-scratches with our gentle, high-foam dirt extraction method. Includes full Ph-neutral exterior purification and soft-towel drying.' },
    { title: 'Tyre Shine & Care', price: 'FROM KES 200', desc: 'Prevent dry rot and fading with our deep-penetrating UV-resistant tire glazing. Restorative jet-black finish that guarantees lasting rubber protection on the road.' },
    { title: 'Executive Full Wash', price: 'FROM KES 1,500', desc: 'Enjoy a pristine, fresh-smelling cabin alongside a dazzling exterior finish. A truly comprehensive interior vacuuming and exterior concierge cleaning solution.' },
    { title: 'Mirror Finish Waxing', price: 'FROM KES 3,000', desc: 'Shield your vehicle from environmental contaminants while achieving a showroom-level reflective shine. We apply a high-gloss protective layer for lasting paint brilliance.' },
    { title: 'Paint Buffing & Restore', price: 'FROM KES 5,000', desc: 'Eliminate swirl marks and oxidation to permanently restore your paint’s original depth and clarity. Meticulous scratch removal mapping and surface correction.' }
  ],
  laundry: [
    { title: 'Express Wash & Fold', price: 'FROM KES 800', desc: 'Save hours of your week with our gentle wash cycles that preserve fabric integrity and color. Guaranteed premium cleaning and precise folding for your daily wear.' },
    { title: 'Pro Steam Ironing', price: 'FROM KES 300', desc: 'Step into every meeting with confidence wearing perfectly crisp, wrinkle-free attire. Expert zero-crease precision pressing tailored for sharp executive looks.' },
    { title: 'Elite Dry Cleaning', price: 'FROM KES 1,200', desc: 'Extend the lifespan of your suits and dresses with our advanced stain-removal technology. Specialized chemical care strictly designed for formal and delicate fabrics.' },
    { title: 'Curtain Restoration', price: 'FROM KES 2,000', desc: 'Instantly brighten your living spaces by eliminating deeply embedded dust and allergens. Total deep cleaning and high-grade refreshing for home window treatments.' },
    { title: 'Carpet Deep Extraction', price: 'FROM KES 5,000', desc: 'Remove stubborn stains, pet odors, and trapped bacteria for a healthier, fresher home. We employ medical-grade industrial cleaning for residential and office rugs.' }
  ]
};

// Mock data for carwash showcase
const carwashShowcase = [
  { before: 'https://images.unsplash.com/photo-1605499270744-8d4866ca557c?auto=format&fit=crop&q=80&w=800', after: 'https://images.unsplash.com/photo-1552933061-90320eecd1f1?auto=format&fit=crop&q=80&w=800' },
];

interface ServicesProps {
  onBook: (service: string) => void;
  onGetTicket: (service: string) => void;
}

export default function Services({ onBook, onGetTicket }: ServicesProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('cyber');
  const [compareSlider, setCompareSlider] = useState(50);

  return (
    <section id="services" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-[#1D1D1F]"> {t('services_title').split(' ')[0]} <span className="text-black/40 italic">{t('services_title').split(' ').slice(1).join(' ')}</span></h2>
            <p className="text-lg text-black/50">{t('services_desc')}</p>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex flex-nowrap md:flex-wrap gap-2 md:gap-4 mb-8 md:mb-16 p-2 overflow-x-auto md:overflow-x-visible no-scrollbar -mx-4 px-4 md:mx-0 md:px-2 scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "flex-none md:flex-1 flex items-center justify-center gap-2 md:gap-3 px-6 md:px-2 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all whitespace-nowrap md:min-w-[120px] transition-all",
                activeTab === cat.id 
                  ? "bg-white text-brand-blue shadow-lg scale-105" 
                  : "text-black/30 hover:text-black/60 bg-black/5 md:bg-transparent"
              )}
            >
              <cat.icon size={18} className="md:w-5 md:h-5" />
              <span className="text-sm md:text-base">{t(`cat_${cat.id}`).split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Service Listing */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-[#1D1D1F] mb-2">{t(`cat_${activeTab}`)}</h3>
                  <div className="h-1.5 w-12 bg-brand-blue rounded-full" />
                </div>

                {serviceDetails[activeTab as keyof typeof serviceDetails].map((service, i) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 border-white/60 hover:border-brand-blue/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-[#1D1D1F]">{service.title}</h4>
                      <span className="text-sm font-black text-brand-blue bg-brand-blue/5 px-3 py-1 rounded-full uppercase">{service.price}</span>
                    </div>
                    <p className="text-black/50 text-sm mb-6">{service.desc}</p>
                    <div className="flex gap-4 mt-6">
                      <button 
                        onClick={() => onBook(service.title)}
                        className="flex-1 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-white px-6 py-3 bg-brand-blue rounded-full shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <Calendar size={16} /> {t('book_now')}
                      </button>

                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Visual Showcase (Conditional for Carwash) */}
          <div className="sticky top-24">
            {activeTab === 'carwash' ? (
              <div className="glass-card p-4 overflow-hidden border-white/60 aspect-square relative group">
                <div className="absolute inset-0 select-none pointer-events-none">
                  <img src={carwashShowcase[0].after} className="h-full w-full object-cover" alt="Carwash After" />
                </div>
                <div 
                  className="absolute inset-0 overflow-hidden select-none pointer-events-none border-r-2 border-white shadow-2xl"
                  style={{ width: `${compareSlider}%` }}
                >
                  <img src={carwashShowcase[0].before} className="h-full w-[200%] max-w-none object-cover" alt="Carwash Before" />
                </div>
                
                {/* Control Slider */}
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={compareSlider}
                  onChange={(e) => setCompareSlider(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize z-20"
                />
                
                {/* Labels */}
                <div className="absolute top-6 left-6 z-10 glass-card px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-black/40 text-white">Before</div>
                <div className="absolute top-6 right-6 z-10 glass-card px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-brand-blue/60 text-white border-brand-blue/50">After</div>

                <div className="absolute bottom-6 left-6 right-6 z-10 p-6 glass-card bg-white/10 border-white/20 backdrop-blur-3xl text-white">
                  <h4 className="text-xl font-bold mb-1">Meticulous Transformation</h4>
                  <p className="text-xs text-white/60 uppercase font-black tracking-widest">Admin Verified Showcase</p>
                </div>
              </div>
            ) : (
              <div className="glass-card overflow-hidden border-white/60 aspect-square group relative">
                <img 
                  src={activeTab === 'cyber' ? 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200' :
                       activeTab === 'barber' ? 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200' :
                       'https://images.unsplash.com/photo-1545173168-9f1947eebb9f?auto=format&fit=crop&q=80&w=1200'}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={activeTab}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-10 left-10 text-white">
                   <p className="text-xs font-black uppercase tracking-[0.3em] text-white/60 mb-2">Category Showcase</p>
                   <h4 className="text-4xl font-bold">{categories.find(c => c.id === activeTab)?.title}</h4>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
