import { motion } from 'motion/react';
import { Menu, X, User, LayoutDashboard, Workflow, Bell } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

import { useLanguage } from '../context/LanguageContext';
import { useInquiries } from '../context/InquiryContext';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { name: 'nav_home', href: '/' },
  { name: 'nav_services', href: '/services' },
  { name: 'nav_gallery', href: '/gallery' },
  { name: 'nav_about', href: '/about' },
  { name: 'nav_contact', href: '#contact' },
];

interface NavbarProps {
  onSignIn: () => void;
  onOpenProfile?: () => void;
  onBook: () => void;
}

export default function Navbar({ onSignIn, onOpenProfile, onBook }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount } = useInquiries();
  const { user, isAdmin } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-6 left-1/2 z-50 w-[95%] max-w-6xl -translate-x-1/2"
      id="main-nav"
    >
      <div className="glass-card flex items-center justify-between px-4 md:px-8 py-3 md:py-4 backdrop-blur-xl gap-8">
        <div className="flex-none">
          <Link 
            to="/" 
            className="flex items-center group w-fit"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="h-10 w-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-lg shadow-brand-blue/20 transition-transform group-hover:scale-110 group-active:scale-95">
               <Workflow size={22} className="rotate-45" />
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 lg:gap-12 md:flex">
          {navLinks.map((link) => (
            link.href.startsWith('#') ? (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-bold text-[#1D1D1F]/40 transition-colors hover:text-brand-blue tracking-tight"
              >
                {t(link.name)}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className="text-xs font-bold text-[#1D1D1F]/40 transition-colors hover:text-brand-blue tracking-tight"
              >
                {t(link.name)}
              </Link>
            )
          ))}
        </div>

        <div className="flex-1 flex justify-end items-center gap-6">
          <div className="hidden xl:flex items-center bg-black/5 rounded-full p-1 border border-black/5 relative h-10">
            <motion.div
              initial={false}
              animate={{ x: language === 'en' ? 0 : 44 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute h-8 w-12 bg-white rounded-full shadow-sm shadow-black/5"
            />
            <button 
              onClick={() => setLanguage('en')}
              className={cn(
                "relative z-10 w-12 text-[10px] font-black transition-colors duration-300", 
                language === 'en' ? "text-brand-blue" : "text-black/30 hover:text-black/60"
              )}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('sw')}
              className={cn(
                "relative z-10 w-12 text-[10px] font-black transition-colors duration-300", 
                language === 'sw' ? "text-brand-blue" : "text-black/30 hover:text-black/60"
              )}
            >
              SW
            </button>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="h-11 w-11 glass-card flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-sm active:scale-95 relative"
                    title="Admin Terminal"
                  >
                     <LayoutDashboard size={20} />
                     {unreadCount > 0 && (
                       <span className="absolute -top-1 -right-1 h-5 w-5 bg-semantic-red text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce-slow">
                         {unreadCount > 9 ? '9+' : unreadCount}
                       </span>
                     )}
                  </Link>
                )}
                <button 
                  onClick={onOpenProfile}
                  className="flex items-center gap-3 bg-black/5 rounded-full pl-4 pr-1 py-1 border border-black/5 hover:bg-black/10 transition-all h-11"
                >
                   <span className="text-[10px] font-black text-black/40 uppercase tracking-widest truncate max-w-[80px]">{user.email.split('@')[0]}</span>
                   <div className="h-9 w-9 rounded-full bg-brand-blue shadow-lg border-2 border-white overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} className="w-full h-full object-cover" />
                   </div>
                </button>
              </div>
            ) : (
              <button 
                onClick={onSignIn}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-blue/10 text-brand-blue font-bold text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-sm"
              >
                 <User size={14} />
                 {t('sign_in')}
              </button>
            )}

            <button onClick={onBook} className="rounded-full bg-[#1D1D1F] px-8 py-3 text-xs font-bold text-white transition-transform hover:bg-brand-blue hover:scale-105 active:scale-95 shadow-lg shadow-black/10">
              {t('book_now')}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 rounded-full hover:bg-black/5 transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mt-4 flex flex-col gap-4 p-6 md:hidden"
        >
          {navLinks.map((link) => (
            link.href.startsWith('#') ? (
              <a
                key={link.name}
                href={link.href}
                className="text-lg font-medium text-[#1D1D1F]/70"
                onClick={() => setIsOpen(false)}
              >
                {t(link.name)}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className="text-lg font-medium text-[#1D1D1F]/70"
                onClick={() => setIsOpen(false)}
              >
                {t(link.name)}
              </Link>
            )
          ))}
          {!user && (
            <button 
              onClick={() => { setIsOpen(false); onSignIn(); }}
              className="w-full flex justify-center items-center gap-2 rounded-full border-2 border-brand-blue/20 bg-brand-blue/5 py-3 font-semibold text-brand-blue"
            >
              Sign In
            </button>
          )}
          <button onClick={() => { setIsOpen(false); onBook(); }} className="w-full rounded-full bg-[#1D1D1F] py-3 font-semibold text-white">
            {t('book_now')}
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
