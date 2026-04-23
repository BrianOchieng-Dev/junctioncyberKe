import Hero from './components/Hero';
import Navbar from './components/Navbar';
import Services from './components/Services';
import About from './components/About';
import FAQ from './components/FAQ';
import Testimonials from './components/Testimonials';
import Team from './components/Team';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminDashboard from './components/AdminDashboard';
import Modal from './components/Modal';
import ServiceGallery from './components/ServiceGallery';
import { motion, useScroll, useSpring } from 'motion/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, ReactNode } from 'react';
import { Ticket as TicketIcon, Download, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { InquiryProvider } from './context/InquiryContext';
import { supabase } from './lib/supabase';
import AuthModalContent from './components/AuthModalContent';
import Community from './components/Community';
import ServicesSummary from './components/ServicesSummary';
import AboutSummary from './components/AboutSummary';
import InquiryForm from './components/InquiryForm';
import PromotionsPoster from './components/PromotionsPoster';
import CarwashShowcase from './components/CarwashShowcase';
import ProfileSettings from './components/ProfileSettings';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthGate from './components/AuthGate';
import { NotificationProvider } from './context/NotificationContext';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-black/[0.02]">
       <div className="glass-card p-12 text-center max-w-lg border-white shadow-2xl">
          <div className="h-24 w-24 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-8 animate-pulse">
             <X size={48} />
          </div>
          <h1 className="text-4xl font-black mb-4">Error 404</h1>
          <p className="text-black/50 mb-8 font-medium">The terminal could not locate the requested transmission. The path may have been encrypted or purged.</p>
          <a href="/" className="btn-primary w-full shadow-brand-blue/30">Return to Base Station</a>
       </div>
    </div>
  );
}

interface LayoutProps {
  children: ReactNode;
  modalType: string | null;
  setModalType: (type: any) => void;
  t: (key: string) => string;
  onOpenProfile?: () => void;
}

function Layout({ children, modalType, setModalType, t, onOpenProfile }: LayoutProps) {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [formLoading, setFormLoading] = useState(false);

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const serviceVal = formData.get('service') as string;
    const dateVal = formData.get('date') as string;

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      service: serviceVal || modalType,
      message: `${formData.get('message')}${formData.get('car_plate') ? ` | Car Plate: ${formData.get('car_plate')}` : ''}`,
      status: 'unread',
      type: modalType
    };

    try {
      if (modalType === 'book') {
        const { error } = await supabase.from('bookings').insert([{
          user_id: user?.id,
          user_name: formData.get('name'),
          user_email: formData.get('email'),
          service: serviceVal,
          date: dateVal,
          time: '10:00 AM', // Default time as form only captures date
          status: 'pending',
          details: formData.get('message'),
          car_plate: formData.get('car_plate')
        }]);
        if (error) throw error;
        toast.success(`Successfully booked ${serviceVal} for ${dateVal}!`);
      } else {
        const { error } = await supabase.from('inquiries').insert([data]);
        if (error) throw error;
        toast.success('Successfully Submitted!');
      }
      
      setModalType(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Submission failed. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" aria-label="Notifications" />
      <motion.div className="fixed top-0 left-0 right-0 z-[100] h-1 origin-left bg-brand-blue shadow-[0_0:10px_rgba(0,122,255,1)]" style={{ scaleX }} />
      <Navbar 
        onSignIn={() => setModalType('auth')} 
        onOpenProfile={onOpenProfile} 
        onBook={() => setModalType('book')}
      />
      <div className="relative pt-10">{children}</div>
      <WhatsAppButton />
      <Modal isOpen={modalType !== null} onClose={() => setModalType(null)} title={modalType === 'quote' ? t('request_quote') : modalType === 'book' ? t('book_now') : modalType === 'ticket' ? 'Your Secure Ticket' : modalType === 'profile' ? 'Profile Customization' : 'Community Access'}>
        {modalType === 'auth' ? <AuthModalContent onClose={() => setModalType(null)} /> : modalType === 'profile' ? <ProfileSettings user={user} onClose={() => setModalType(null)} /> : modalType === 'ticket' ? (
          /* ... existing ticket code ... */
          <div className="p-8 space-y-6">
            <div className="glass-card bg-brand-blue/5 border-dashed border-2 border-brand-blue/20 p-8 rounded-[40px] relative overflow-hidden">
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="text-2xl font-black tracking-tighter text-brand-blue uppercase">The Junction</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Premium Service Pass</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                     <TicketIcon size={24} className="text-brand-blue" />
                  </div>
               </div>
               
               <div className="space-y-4 mb-20">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-black/30">Client Name</p>
                    <p className="text-sm font-bold text-[#1D1D1F]">{user?.email?.split('@')[0] || 'Premium Guest'}</p>
                  </div>
                  <div className="flex gap-10">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-black/30">Ticket ID</p>
                      <p className="text-sm font-bold text-[#1D1D1F]">TJ-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-black/30">Validity</p>
                      <p className="text-sm font-bold text-[#1D1D1F]">Single Session</p>
                    </div>
                  </div>
               </div>

               <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-brand-blue/10 rounded-full blur-3xl" />
               <div className="pt-6 border-t-2 border-dashed border-black/5 flex items-center justify-between">
                  <div className="h-10 w-full bg-black/5 rounded-lg border border-black/5 flex items-center justify-center gap-2 overflow-hidden px-4">
                     {[...Array(20)].map((_, i) => <div key={i} className="h-full w-1.5 bg-black/10" />)}
                  </div>
               </div>
            </div>
            <button 
              onClick={() => { window.print(); setModalType(null); }}
              className="w-full rounded-full bg-brand-blue py-4 font-bold text-white shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-2"
            >
               <Download size={20} /> Download Digital Ticket
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-black/40 ml-2">Full Name</label>
              <input type="text" name="name" required placeholder="John Doe" className="w-full rounded-2xl border-black/5 bg-black/5 p-4 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-black/40 ml-2">Email Address</label>
              <input type="email" name="email" required placeholder="john@example.com" className="w-full rounded-2xl border-black/5 bg-black/5 p-4 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" />
            </div>
            {modalType === 'book' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black/40 ml-2">Preferred Service</label>
                  <select name="service" defaultValue="" className="w-full rounded-2xl border-black/5 bg-black/5 p-4 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium">
                    <option value="" disabled>Select a Service</option>
                    <optgroup label="Cyber Services">
                      <option value="Printing">Printing</option>
                      <option value="Photocopying">Photocopying</option>
                      <option value="Lamination">Lamination</option>
                      <option value="Stationary">Stationary</option>
                      <option value="Type Setting">Type Setting</option>
                      <option value="Soft Drinks">Soft Drinks</option>
                      <option value="Web Design">Web Design</option>
                    </optgroup>
                    <optgroup label="Barbershop Services">
                      <option value="Massage">Massage</option>
                      <option value="Haircut">Haircut</option>
                      <option value="Dye Application">Dye Application</option>
                      <option value="Gel Application">Gel Application</option>
                    </optgroup>
                    <optgroup label="Carwash Services">
                      <option value="Body Wash">Body Wash</option>
                      <option value="Tyer Shine">Tire Shine</option>
                      <option value="Full Wash">Full Wash</option>
                      <option value="Waxing">Waxing</option>
                      <option value="Buffing">Buffing</option>
                    </optgroup>
                    <optgroup label="Laundry Services">
                      <option value="Wash and Fold">Wash and Fold</option>
                      <option value="Ironing">Ironing</option>
                      <option value="Dry Cleaning">Dry Cleaning</option>
                      <option value="Curtain Cleaning">Curtain Cleaning</option>
                      <option value="Carpet Cleaning">Carpet Cleaning</option>
                    </optgroup>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black/40 ml-2">Car Plate Number (For Carwash)</label>
                  <input 
                    type="text" 
                    name="car_plate" 
                    placeholder="KAA 001A" 
                    className="w-full rounded-2xl border-black/5 bg-black/5 p-4 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black/40 ml-2">Preferred Date</label>
                  <input 
                    type="date" 
                    name="date"
                    required 
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-2xl border-black/5 bg-black/5 p-4 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black/40 ml-2">Details / Message</label>
              <textarea name="message" rows={3} placeholder="Tell us more about your request..." className="w-full rounded-2xl border-black/5 bg-black/5 p-4 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium text-black/60"></textarea>
            </div>
            <button type="submit" disabled={formLoading} className="w-full flex items-center justify-center gap-3 rounded-full bg-brand-blue py-4 font-bold text-white shadow-lg shadow-brand-blue/20 transition-transform active:scale-95 disabled:opacity-50">
              {formLoading ? (
                 <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                 </>
              ) : 'Submit Request'}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [modalType, setModalType] = useState<'quote' | 'inquiry' | 'book' | 'auth' | 'ticket' | 'profile' | null>(null);

  if (authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <InquiryProvider user={user}>
      <NotificationProvider user={user}>
        <LanguageConsumer user={user} modalType={modalType} setModalType={setModalType} />
      </NotificationProvider>
    </InquiryProvider>
  );
}

function LanguageConsumer({ user, modalType, setModalType }: any) {
  const { t } = useLanguage();

  return (
    <Router>
      <main className="mesh-gradient min-h-screen selection:bg-brand-blue/10">
        <Routes>
          <Route path="/" element={
            <Layout 
              modalType={modalType} 
              setModalType={setModalType} 
              t={t} 
              onOpenProfile={() => setModalType('profile')}
            >
              <Hero 
                onOpenQuote={() => setModalType('quote')} 
                isAuthenticated={!!user}
              />
              <PromotionsPoster />
              <ServicesSummary />
              <CarwashShowcase />
              <AboutSummary />
              <Community isAuthenticated={!!user} onJoin={() => setModalType('auth')} />
              <Testimonials />
              <InquiryForm />
              <FAQ />
              <Footer />
            </Layout>
          } />
          <Route path="/services" element={
            <Layout 
              modalType={modalType} 
              setModalType={setModalType} 
              t={t} 
              onOpenProfile={() => setModalType('profile')}
            >
              <Services onBook={() => setModalType('book')} onGetTicket={() => setModalType('ticket')} />
              <InquiryForm />
              <Footer />
            </Layout>
          } />
          <Route path="/gallery" element={
            <Layout 
              modalType={modalType} 
              setModalType={setModalType} 
              t={t} 
              onOpenProfile={() => setModalType('profile')}
            >
              <ServiceGallery />
              <InquiryForm />
              <Footer />
            </Layout>
          } />
          <Route path="/about" element={
            <Layout 
              modalType={modalType} 
              setModalType={setModalType} 
              t={t} 
              onOpenProfile={() => setModalType('profile')}
            >
              <About />
              <Team />
              <InquiryForm />
              <Footer />
            </Layout>
          } />
          <Route path="/admin" element={
            <AuthGate requireAdmin>
              <AdminDashboard />
            </AuthGate>
          } />
          <Route path="*" element={
            <Layout 
              modalType={modalType} 
              setModalType={setModalType} 
              t={t} 
              onOpenProfile={() => setModalType('profile')}
            >
              <NotFound />
              <Footer />
            </Layout>
          } />
        </Routes>
      </main>
    </Router>
  );
}
