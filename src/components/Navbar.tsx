import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User, LayoutDashboard, Workflow, Bell } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

import { useLanguage } from '../context/LanguageContext';
import { useInquiries } from '../context/InquiryContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount: adminUnreadCount } = useInquiries();
  const { unreadCount: userUnreadCount } = useNotifications();
  const { user, isAdmin, profile } = useAuth();

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
                className="text-sm font-bold text-[#1D1D1F]/40 transition-colors hover:text-brand-blue tracking-tight"
              >
                {t(link.name)}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-bold text-[#1D1D1F]/40 transition-colors hover:text-brand-blue tracking-tight"
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
                     {adminUnreadCount > 0 && (
                       <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 h-5 w-5 bg-semantic-red text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce-slow shadow-lg shadow-red-500/40">
                         {adminUnreadCount > 9 ? '9+' : adminUnreadCount}
                       </span>
                     )}
                  </Link>
                )}
                
                {/* User Notifications */}
                {!isAdmin && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="h-11 w-11 glass-card flex items-center justify-center text-brand-blue hover:bg-brand-blue/5 transition-all shadow-sm active:scale-95 relative"
                    >
                      <Bell size={20} />
                      {userUnreadCount > 0 && (
                        <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 h-5 w-5 bg-semantic-red text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse shadow-[0_0_15px_rgba(255,59,48,0.5)]">
                          {userUnreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-4 w-80 glass-card bg-white/90 p-4 shadow-2xl z-[100] border border-black/5"
                        >
                          <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black/40">Notifications</h3>
                            <button className="text-[10px] font-bold text-brand-blue hover:underline">Mark all read</button>
                          </div>
                          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                            {userUnreadCount === 0 && (
                              <div className="text-center py-8 text-black/20 text-[10px] font-bold uppercase tracking-widest">No new alerts</div>
                            )}
                            {/* Simple list of notifications would go here - for now showing a placeholder if count > 0 */}
                            {userUnreadCount > 0 && (
                              <div className="p-3 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
                                <p className="text-xs font-medium text-[#1D1D1F]">Admin replied to your inquiry</p>
                                <p className="text-[9px] text-black/40 mt-1">Just now</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <button 
                  onClick={onOpenProfile}
                  className="flex items-center gap-3 bg-black/5 rounded-full pl-4 pr-1 py-1 border border-black/5 hover:bg-black/10 transition-all h-11"
                >
                   <span className="text-[10px] font-black text-black/40 uppercase tracking-widest truncate max-w-[80px]">{profile?.full_name || user.email?.split('@')[0]}</span>
                   <div className="h-9 w-9 rounded-full bg-brand-blue shadow-lg border-2 border-white overflow-hidden">
                      <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} className="w-full h-full object-cover" />
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

            <button onClick={onBook} className="hidden md:block rounded-full bg-[#1D1D1F] px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-white transition-all hover:bg-brand-blue hover:scale-105 active:scale-95 shadow-xl shadow-black/10">
              {t('book_now')}
            </button>
          </div>

          {/* Admin Terminal for Mobile */}
          {user && isAdmin && (
            <Link 
              to="/admin" 
              className="md:hidden h-10 w-10 glass-card flex items-center justify-center text-brand-blue shadow-sm active:scale-95 relative"
              title="Admin Terminal"
            >
               <LayoutDashboard size={18} />
                {adminUnreadCount > 0 && (
                  <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-semantic-red text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce-slow shadow-md shadow-red-500/40">
                    {adminUnreadCount > 9 ? '9+' : adminUnreadCount}
                  </span>
                )}
            </Link>
          )}

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
          {user && isAdmin && (
            <Link 
              to="/admin" 
              className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-brand-blue/20 bg-brand-blue/5 py-3 font-semibold text-brand-blue mb-2"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard size={20} />
              Admin Dashboard
            </Link>
          )}
          {!user && (
            <button 
              onClick={() => { setIsOpen(false); onSignIn(); }}
              className="w-full flex justify-center items-center gap-2 rounded-full border-2 border-brand-blue/20 bg-brand-blue/5 py-3 font-semibold text-brand-blue"
            >
              Sign In
            </button>
          )}
          <button onClick={() => { setIsOpen(false); onBook(); }} className="w-full rounded-full bg-[#1D1D1F] py-5 font-black uppercase tracking-[0.2em] text-[10px] text-white shadow-xl">
            {t('book_now')}
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
