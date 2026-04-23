import { motion } from 'motion/react';
import { Send, MessageSquare, Mail, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

export default function InquiryForm() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            service: formData.service, 
            message: formData.message,
            status: 'unread'
          }
        ]);
      
      if (error) throw error;
      setSubmitted(true);
      toast.success('Inquiry sent successfully!');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      console.error('Failed to send inquiry:', err);
      toast.error('Failed to send inquiry: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 px-4 bg-black/[0.02]" id="contact">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card overflow-hidden border-white/60 shadow-2xl flex flex-col lg:flex-row">
          {/* Left Info Panel */}
          <div className="w-full lg:w-1/3 bg-brand-blue p-6 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t('contact_title').split(' ').slice(0, 2).join(' ')} <br/>{t('contact_title').split(' ').slice(2).join(' ')}</h2>
              <p className="text-white/70 mb-8">
                Have a specific requirement? Our concierge team is ready to assist you with bespoke service packages.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">Email Us</p>
                    <p className="font-medium">contact@thejunctioncyber.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">Live Support</p>
                    <p className="font-medium">Available 24/7 via WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex-1 flex flex-col pt-8 border-t border-white/10 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Location</p>
                <p className="text-sm font-medium">Main Branch, Nairobi, Kenya</p>
              </div>
              <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden glass-card mt-2 shadow-2xl relative border-white/20">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127641.87425178659!2d36.7513364!3d-1.2833333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1714000000000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-700 pointer-events-auto"
                ></iframe>
                <div className="absolute inset-0 bg-brand-blue/10 pointer-events-none mix-blend-overlay"></div>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="w-full lg:w-2/3 p-6 bg-white/80 backdrop-blur-xl">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                  <Send size={40} />
                </div>
                <h3 className="text-2xl font-bold text-[#1D1D1F]">Inquiry Sent Successfully</h3>
                <p className="text-black/50 max-w-sm">Thank you for reaching out. An executive member will contact you shortly.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-black/40 ml-2">{t('full_name')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                      <input 
                        type="text" 
                        required 
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-2xl border-black/5 bg-black/5 p-4 pl-12 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-black/40 ml-2">{t('email_addr')}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                      <input 
                        type="email" 
                        required 
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-2xl border-black/5 bg-black/5 p-4 pl-12 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-black/40 ml-2">{t('service_interest')}</label>
                  <select 
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full rounded-2xl border-black/5 bg-black/5 p-4 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none font-medium text-black/60"
                  >
                    <option value="">Select a service...</option>
                    <option value="Cyber Services">Cyber Services & Digital Access</option>
                    <option value="Barber">Precision Barber & Grooming</option>
                    <option value="Carwash">Elite Carwash & Detailing</option>
                    <option value="Laundry">Premium Laundry & Garment Care</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-black/40 ml-2">{t('detailed_msg')}</label>
                  <textarea 
                    rows={4} 
                    required 
                    placeholder="How can we help you today?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-2xl border-black/5 bg-black/5 p-4 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-black/60 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full py-5 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                   {loading ? (
                     <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('processing')}
                     </>
                   ) : (
                     <>
                        {t('send_inquiry')} <Send size={20} />
                     </>
                   )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
