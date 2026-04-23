import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Marcus Thorne",
    role: "Tech CEO",
    text: "The internet speed here is unmatched, but the premium grooming experience while I wait for my car detail is what truly sets The Junction apart.",
    rating: 5
  },
  {
    name: "Elena Rodriguez",
    role: "Architect",
    text: "Meticulous care. I trust them with my luxury SUV and my most delicate garments. It's the only place that meets my standards.",
    rating: 5
  },
  {
    name: "David Chen",
    role: "Freelancer",
    text: "A true productivity oasis. The atmosphere is sleek, the coffee is great, and the 24/7 access has been a game-changer for my global projects.",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-[#1D1D1F]">
          Reserved for <span className="text-black/40 italic">Excellence</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 flex flex-col justify-between hover:border-brand-blue/30 group transition-all"
            >
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-brand-blue text-brand-blue" />
                  ))}
                </div>
                <p className="text-lg text-[#1D1D1F]/70 italic mb-8">"{t.text}"</p>
              </div>
              
              <div>
                <div className="h-[1px] w-full bg-black/10 mb-6" />
                <h4 className="font-bold text-[#1D1D1F]">{t.name}</h4>
                <p className="text-xs text-[#1D1D1F]/30 tracking-widest uppercase font-semibold">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
