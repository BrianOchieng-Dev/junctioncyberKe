import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: "What are your cyber operating hours?",
    a: "Our cyber hub is open 24/7 for premium members, and 8 AM to Midnight for standard walk-ins."
  },
  {
    q: "Do I need an appointment for the barbershop?",
    a: "While we accept walk-ins, we highly recommend booking via our app or website to ensure you get your preferred master barber."
  },
  {
    q: "How long does an 'Elite Detail' carwash take?",
    a: "A standard elite detail takes approximately 90 minutes. You can relax in our Cyber Lounge or grab a haircut while you wait."
  },
  {
    q: "Is there a pickup service for laundry?",
    a: "Yes! We offer a premium valet pickup and delivery service within a 15km radius of the hub."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-12 px-4 bg-black/[0.02]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#1D1D1F]">Common Questions</h2>
          <p className="text-black/40">Everything you need to know about The Junction experience.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card border-black/5 bg-black/[0.01]">
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="text-lg font-semibold text-[#1D1D1F]">{faq.q}</span>
                {openIndex === i ? <Minus size={20} className="text-brand-blue" /> : <Plus size={20} className="text-[#1D1D1F]/40" />}
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-black/50 leading-relaxed border-t border-black/5 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
