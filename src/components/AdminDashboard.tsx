import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Layers, 
  MessageSquare, 
  LogOut, 
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Tag,
  Calendar,
  Truck,
  Send,
  User,
  Save,
  Bell,
  Home,
  RefreshCw,
  Camera,
  Megaphone,
  Droplets
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';

import { supabase } from '../lib/supabase';
import { useInquiries } from '../context/InquiryContext';
import { useAuth } from '../context/AuthContext';

type Tab = 'overview' | 'showcase' | 'team' | 'promotions' | 'inbox' | 'scheduler' | 'logistics' | 'settings';

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  service: string;
  message: string;
  status: 'unread' | 'read';
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [heroBg, setHeroBg] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const { unreadCount, resetCount } = useInquiries();

  // Gallery State
  const GALLERY_CATEGORIES = ['Cyber Services', 'Precision Barber', 'Elite Carwash', 'Premium Laundry'];
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  
  // Carwash Showcase States
  const [carwashItems, setCarwashItems] = useState<any[]>([]);
  const [carwashForm, setCarwashForm] = useState({ before: '', after: '', model: '' });
  const [carwashLoading, setCarwashLoading] = useState(false);
  const [uploadingCarwash, setUploadingCarwash] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(GALLERY_CATEGORIES[0]);
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Promotions State
  const [promotions, setPromotions] = useState<any[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState(false);
  const [promoForm, setPromoForm] = useState({
    title: '',
    offer: '',
    desc: '',
    img: '',
    tag: GALLERY_CATEGORIES[0]
  });
  const [uploadingPromo, setUploadingPromo] = useState(false);

  useEffect(() => {
    // Fetch initial data
    fetchSettings();
    fetchInquiries();
    fetchGalleryItems();
    fetchPromotions();
    fetchCarwashItems();

    // Subscribe to new inquiries
    const channel = supabase
      .channel('admin_inquiries')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inquiries' },
        (payload) => {
          setInquiries(prev => [payload.new as Inquiry, ...prev]);
        }
      )
      .subscribe();

    // Subscribe to carwash changes
    const carwashChannel = supabase
      .channel('admin_carwash')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'carwash_showcase' },
        () => {
          fetchCarwashItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(carwashChannel);
    };
  }, []);

  const fetchCarwashItems = async () => {
    setCarwashLoading(true);
    const { data } = await supabase.from('carwash_showcase').select('*').order('created_at', { ascending: false });
    if (data) setCarwashItems(data);
    setCarwashLoading(false);
  };

  const fetchInquiries = async () => {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setInquiries(data);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('inquiries')
      .update({ status: 'read' })
      .eq('id', id);
    
    if (!error) {
      setInquiries(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'read' } : inv));
      // Optionally trigger count refresh in context
    }
  };

  const selectedInquiry = inquiries.find(i => i.id === selectedInquiryId);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'hero_bg')
        .single();
      
      if (data) setHeroBg(data.value);
    } catch (err) {
      console.warn('Settings not found, using defaults.');
    }
  };

  const saveSettings = async () => {
    try {
      setSaveLoading(true);
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'hero_bg', value: heroBg }, { onConflict: 'key' });
      
      if (error) throw error;
      toast.success('Settings updated successfully!');
    } catch (err: any) {
      toast.error('Failed to save settings: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUploadBg = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingBg(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-bg-${Math.random()}.${fileExt}`;
      const filePath = `settings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setHeroBg(publicUrl);
      toast.success('Background uploaded! Click Save to apply.');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploadingBg(false);
    }
  };

  const fetchGalleryItems = async () => {
    setGalleryLoading(true);
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setGalleryItems(data);
    }
    setGalleryLoading(false);
  };

  const handleAddGalleryItem = async (e: any) => {
    e.preventDefault();
    if (!galleryImageUrl) return toast.error("Please provide an image URL.");
    
    setUploadingGallery(true);
    try {
      const { error } = await supabase
        .from('gallery')
        .insert([{ category: selectedCategory, image_url: galleryImageUrl }]);
      if (error) throw error;
      toast.success('Gallery item added!');
      setGalleryImageUrl('');
      fetchGalleryItems();
    } catch (err: any) {
      toast.error('Failed to add: ' + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      toast.success('Gallery item deleted!');
      fetchGalleryItems();
    } catch(err: any) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const fetchPromotions = async () => {
    setPromotionsLoading(true);
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setPromotions(data);
    }
    setPromotionsLoading(false);
  };

  const handleAddPromotion = async (e: any) => {
    e.preventDefault();
    if (!promoForm.title || !promoForm.offer || !promoForm.desc || !promoForm.img) {
      return toast.error("Please fill all fields.");
    }
    
    setUploadingPromo(true);
    try {
      const { error } = await supabase
        .from('promotions')
        .insert([{ ...promoForm }]);
      if (error) throw error;
      toast.success('Promotion added successfully!');
      setPromoForm({ title: '', offer: '', desc: '', img: '', tag: GALLERY_CATEGORIES[0] });
      fetchPromotions();
    } catch (err: any) {
      toast.error('Failed to add promotion: ' + err.message);
    } finally {
      setUploadingPromo(false);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Promotion deleted!');
      fetchPromotions();
    } catch(err: any) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'showcase', label: 'Gallery', icon: Layers },
    { id: 'carwash', label: 'Carwash', icon: Droplets },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'promotions', label: 'Promotions', icon: Megaphone },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
    { id: 'scheduler', label: 'Bookings', icon: Calendar },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-[#FBFBFD] min-h-screen flex flex-col md:flex-row text-[#1D1D1F] font-sans selection:bg-brand-blue/30 selection:text-white overflow-hidden relative">
      <ToastContainer theme="light" position="bottom-right" aria-label="Notifications" />
      {/* Immersive Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Refined Technical Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-[70] h-screen w-72 bg-white/60 backdrop-blur-2xl border-r border-black/5 flex flex-col p-6 transition-transform duration-500 ease-expo shadow-xl shadow-black/[0.02]",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-blue to-purple-600 shadow-[0_0_20px_rgba(0,122,255,0.3)] flex items-center justify-center">
              <div className="h-3 w-3 bg-white rounded-sm rotate-45" />
            </div>
            <span className="font-black tracking-tighter text-xl text-[#1D1D1F] font-heading">Junction <span className="text-brand-blue">Admin</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden h-10 w-10 flex items-center justify-center text-black/40">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <nav className="flex-grow space-y-1.5 custom-scrollbar pr-2 h-[calc(100vh-250px)] overflow-y-auto">
          <Link 
            to="/"
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-black/40 hover:text-brand-blue hover:bg-brand-blue/5 mb-4 border border-transparent hover:border-brand-blue/10"
          >
            <Home size={20} />
            <span className="font-bold text-sm tracking-tight text-brand-blue font-mono text-[10px] tracking-widest">Back to site</span>
          </Link>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as Tab); setIsSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                activeTab === item.id 
                  ? "text-[#1D1D1F] bg-brand-blue/[0.05] border border-brand-blue/10 shadow-sm" 
                  : "text-black/40 hover:text-[#1D1D1F] hover:bg-black/5"
              )}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill" 
                  className="absolute left-0 w-1 h-6 bg-brand-blue rounded-r-full shadow-[0_0_15px_rgba(0,122,255,0.6)]" 
                />
              )}
              <item.icon size={20} className={cn("shrink-0 transition-colors", activeTab === item.id ? "text-brand-blue" : "group-hover:text-[#1D1D1F]")} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {item.id === 'inbox' && unreadCount > 0 && (
                <span className="ml-auto h-5 w-5 bg-brand-blue text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,122,255,0.4)]">
                  {unreadCount}
                </span>
              )}
              {activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-40" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-black/5">
          <Link 
            to="/"
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-4 rounded-2xl text-black/40 hover:text-red-500 hover:bg-red-500/5 transition-all font-bold group"
          >
            <LogOut size={20} className="group-hover:translate-x-[-2px] transition-transform" />
            <span className="text-sm">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Content Mainframe */}
      <main className="flex-grow h-screen overflow-y-auto custom-scrollbar relative">
        <div className="max-w-[1400px] mx-auto p-4 md:p-10 lg:p-12">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 md:mb-16 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-brand-blue font-black text-[10px] tracking-[0.2em]">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-blue animate-pulse shadow-[0_0_8px_rgba(0,122,255,0.4)]" /> 
                Admin dashboard
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter capitalize text-[#1D1D1F]">
                {activeTab.replace('_', ' ')}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden xl:flex items-center gap-3 px-6 py-3 bg-white border border-black/5 rounded-2xl shadow-sm">
                <div className="relative mr-2">
                  <Bell size={20} className={cn("transition-colors", unreadCount > 0 ? "text-brand-blue" : "text-black/20")} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-semantic-red text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-black/40 tracking-[0.2em] mb-8 font-heading">Brand asset control</p>
                  <p className="text-xs font-mono font-bold text-brand-blue opacity-80">JX-880-ALPHA</p>
                </div>
                <div className="h-8 w-[1px] bg-black/5" />
                <div className="h-10 w-10 rounded-xl overflow-hidden ring-1 ring-black/10">
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100" alt="Admin" className="w-full h-full object-cover" />
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden h-14 w-14 bg-white border border-black/5 shadow-sm rounded-2xl flex items-center justify-center text-brand-blue"
              >
                <LayoutDashboard size={24} />
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }} 
                className="space-y-6 md:space-y-8"
              >
                {/* Bento Grid Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { label: 'Revenue Forecast', val: 'KES 1.25M', change: '+12%', color: 'border-brand-blue/10 bg-brand-blue/[0.02]' },
                    { label: 'Active Bookings', val: '1,284', change: 'Stable', color: 'border-black/5 bg-white' },
                    { label: 'Customers', val: '24', change: 'New', color: 'border-black/5 bg-white' },
                    { label: 'System Status', val: 'Online', change: 'Live', color: 'border-black/5 bg-white' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "border p-6 md:p-8 rounded-[32px] group hover:scale-[1.02] shadow-sm transition-all duration-500",
                        stat.color
                      )}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-bold tracking-[0.1em] text-black/40">{stat.label}</span>
                        <div className="h-6 w-6 rounded-full bg-black/5 flex items-center justify-center">
                          <Plus size={10} className="text-black/40" />
                        </div>
                      </div>
                      <p className="text-2xl md:text-3xl font-black tracking-tight text-[#1D1D1F]">{stat.val}</p>
                      <div className="mt-4 text-[10px] font-bold text-brand-blue tracking-widest">{stat.change}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Hero Feature Bento */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="lg:col-span-2 bg-gradient-to-br from-brand-blue to-purple-800 p-10 md:p-16 rounded-[48px] relative overflow-hidden group">
                    <div className="relative z-10 space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter text-white">Welcome to the<br/>Dashboard.</h3>
                        <p className="text-lg text-white/80 max-w-md font-medium">Manage services, view customer inquiries, and update gallery showcases across the platform.</p>
                      </div>
                      <button className="bg-white text-black font-black px-12 py-5 rounded-full text-sm tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        New announcement
                      </button>
                    </div>
                    {/* Abstract technical visual */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                      <svg viewBox="0 0 200 200" className="w-full h-full translate-x-1/4 -translate-y-1/4">
                        <path d="M 0 100 Q 50 0 100 100 T 200 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-dash" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.1" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-white border border-black/5 p-10 rounded-[48px] shadow-sm flex flex-col items-center justify-center text-center group transition-all hover:bg-black/[0.02]">
                    <div className="h-24 w-24 rounded-full bg-brand-blue/10 flex items-center justify-center mb-8 border border-brand-blue/20 group-hover:scale-110 transition-transform">
                      <Users size={40} className="text-brand-blue" />
                    </div>
                    <h4 className="text-2xl font-black mb-4 text-[#1D1D1F]">Team Overview</h4>
                    <p className="text-sm text-black/40 leading-relaxed font-medium mb-8 tracking-widest">5 Active members <br/>online</p>
                    <button className="w-full py-4 rounded-2xl bg-black/5 border border-transparent font-bold hover:bg-black/10 transition-all text-[#1D1D1F]">Manage Team</button>
                  </div>
                </div>

                {/* Sub-Grid Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="bg-white border border-black/5 p-8 rounded-[40px] shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-sm font-black tracking-widest text-black/40">Recent activity</h4>
                      <MessageSquare size={16} className="text-brand-blue" />
                    </div>
                    <div className="space-y-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 group cursor-pointer">
                          <div className="h-10 w-10 rounded-full bg-black/5 shrink-0 border border-black/5" />
                          <div className="space-y-1">
                            <p className="text-sm font-bold group-hover:text-brand-blue transition-colors text-[#1D1D1F]">New Booking Received</p>
                            <p className="text-[10px] font-medium text-black/40 tracking-widest leading-none">2m ago • Confirmed</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2 bg-white border border-black/5 p-8 rounded-[40px] shadow-sm flex items-center justify-between overflow-hidden relative group">
                    <div className="space-y-6 flex-grow max-w-lg">
                      <h4 className="text-sm font-black tracking-widest text-black/40">Logistics update</h4>
                      <p className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Curtains & Carpets collection finalized for Karen Residence.</p>
                      <div className="flex gap-4">
                        <button className="px-6 py-2 rounded-xl bg-brand-blue/10 text-brand-blue font-black text-[10px] tracking-widest border border-brand-blue/20 hover:bg-brand-blue hover:text-white transition-all shadow-sm">Send driver</button>
                        <button className="px-6 py-2 rounded-xl bg-black/5 text-black/40 font-black text-[10px] tracking-widest border border-transparent hover:bg-black/10 transition-all">Mark done</button>
                      </div>
                    </div>
                    <Truck size={120} className="absolute -right-10 opacity-5 -rotate-12 group-hover:-rotate-0 transition-transform duration-1000 text-[#1D1D1F]" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'inbox' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-auto lg:h-[calc(100vh-280px)]"
              >
                <div className={cn(
                  "bg-white border border-black/5 rounded-[40px] p-6 flex flex-col shadow-sm",
                  selectedInquiry !== null && "hidden lg:flex"
                )}>
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-[10px] font-black tracking-[0.2em] text-black/40 ml-2">Inbox</h3>
                     <button 
                       onClick={async () => {
                         const { error } = await supabase.from('inquiries').update({ status: 'read' }).eq('status', 'unread');
                         if (!error) {
                           setInquiries(prev => prev.map(inv => ({ ...inv, status: 'read' })));
                           resetCount();
                           toast.success('All marked as read');
                         }
                       }}
                       className="text-[10px] font-black tracking-[0.2em] text-brand-blue hover:text-brand-blue/80"
                     >
                       Mark All
                     </button>
                  </div>
                  <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                    {inquiries.map((inquiry) => (
                      <button 
                        key={inquiry.id} 
                        onClick={() => {
                          setSelectedInquiryId(inquiry.id);
                          if (inquiry.status === 'unread') markAsRead(inquiry.id);
                        }}
                        className={cn(
                          "w-full p-5 rounded-[24px] border transition-all text-left flex items-start gap-4 hover:scale-[1.02]",
                          selectedInquiryId === inquiry.id 
                            ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20" 
                            : "bg-black/[0.02] border-transparent hover:border-black/10 text-black/60"
                        )}
                      >
                         <div className={cn(
                           "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                           selectedInquiryId === inquiry.id ? "bg-white/20 text-white" : "bg-black/5 text-brand-blue"
                         )}>
                            <User size={18} />
                         </div>
                         <div className="min-w-0 pr-2 flex-grow">
                            <p className={cn("font-bold text-sm mb-0.5 truncate", selectedInquiryId === inquiry.id ? "text-white" : "text-[#1D1D1F]")}>{inquiry.name}</p>
                            <p className={cn("text-[10px] font-black tracking-wider opacity-60", selectedInquiryId === inquiry.id ? "text-white" : "text-brand-blue")}>
                               {inquiry.service || 'General inquiry'}
                            </p>
                         </div>
                         {inquiry.status === 'unread' && (
                           <div className="h-2 w-2 rounded-full bg-semantic-red animate-pulse mt-2" />
                         )}
                      </button>
                    ))}
                    {inquiries.length === 0 && (
                      <div className="text-center py-20 text-black/20 font-black tracking-widest text-[10px]">No messages</div>
                    )}
                  </div>
                </div>

                <div className={cn(
                  "lg:col-span-3 bg-white border border-black/5 rounded-[40px] flex flex-col relative overflow-hidden shadow-2xl shadow-black/[0.05]",
                  !selectedInquiry && "hidden lg:flex"
                )}>
                  {selectedInquiry ? (
                    <>
                      <div className="p-8 border-b border-black/5 flex items-center justify-between bg-black/[0.02]">
                        <div className="flex items-center gap-6">
                           <button onClick={() => setSelectedInquiryId(null)} className="lg:hidden h-10 w-10 text-black/40"><ChevronRight size={20} className="rotate-180" /></button>
                           <div className="h-16 w-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                             <User size={32} />
                           </div>
                           <div>
                             <h4 className="text-2xl font-black tracking-tighter truncate max-w-md text-[#1D1D1F]">{selectedInquiry.name}</h4>
                             <div className="flex items-center gap-3 mt-1">
                               <span className="text-[10px] font-black text-brand-blue px-2.5 py-1 bg-brand-blue/10 rounded-full border border-brand-blue/20">{selectedInquiry.service || 'General'}</span>
                               <span className="text-[10px] font-black text-black/40 truncate max-w-[200px]">{selectedInquiry.email}</span>
                             </div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button className="h-12 w-12 rounded-xl bg-black/5 text-black/40 hover:text-red-500 transition-all border border-transparent flex items-center justify-center"><Trash2 size={20} /></button>
                        </div>
                      </div>

                      <div className="flex-grow p-8 space-y-10 overflow-y-auto custom-scrollbar">
                        <div className="flex gap-6 max-w-2xl">
                          <div className="h-10 w-10 rounded-full bg-black/5 shrink-0 border border-black/5" />
                          <div className="space-y-2">
                             <div className="p-6 rounded-3xl rounded-tl-none bg-black/5 border border-black/5 text-black/80 font-medium leading-relaxed whitespace-pre-wrap">
                               {selectedInquiry.message}
                             </div>
                             <p className="text-[10px] font-black text-black/30 tracking-widest ml-1">
                               Received {new Date(selectedInquiry.created_at).toLocaleString()}
                             </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 md:p-8 bg-black/5 border-t border-black/5">
                        <div className="flex items-center gap-4 bg-white border border-black/10 p-2.5 rounded-[28px] focus-within:ring-4 focus-within:ring-brand-blue/20 transition-all shadow-sm">
                           <input type="text" placeholder="Draft a reply..." className="flex-grow bg-transparent outline-none px-6 text-sm font-bold text-[#1D1D1F] placeholder:text-black/30" />
                           <button className="h-12 px-10 rounded-2xl bg-brand-blue text-white font-black text-[10px] tracking-[0.1em] shadow-lg shadow-brand-blue/20 hover:scale-105 transition-all flex items-center gap-2">
                             Send <Send size={16} />
                           </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                      <div className="h-40 w-40 rounded-full bg-black/5 flex items-center justify-center mb-12 relative">
                        <MessageSquare size={64} className="text-black/10" strokeWidth={1} />
                        <div className="absolute inset-0 rounded-full border border-brand-blue/10" />
                      </div>
                      <h3 className="text-3xl font-black tracking-[0.1em] text-black/30 mb-4">No conversation selected</h3>
                      <p className="text-sm font-bold text-black/20 max-w-xs leading-loose tracking-widest">Select a message from the inbox to view details.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'showcase' && (
              <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="bg-white border border-black/5 p-12 rounded-[56px] space-y-12 shadow-sm">
                   <div>
                      <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-4 text-[#1D1D1F]">Manage <span className="text-brand-blue ml-2">Gallery</span></h3>
                      <p className="text-black/40 font-bold text-[10px] tracking-[0.2em]">Sector: Select category</p>
                   </div>
                   
                   <form onSubmit={handleAddGalleryItem} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.2em] text-black/40 ml-4">Category</label>
                        <select 
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full pl-6 pr-8 py-5 bg-black/5 border border-black/10 rounded-[32px] outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-bold text-[#1D1D1F]"
                        >
                          {GALLERY_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.2em] text-black/40 ml-4">Image source url</label>
                        <input 
                          type="url" 
                          value={galleryImageUrl}
                          onChange={(e) => setGalleryImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full pl-6 pr-8 py-5 bg-black/5 border border-black/10 rounded-[32px] outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-bold text-[#1D1D1F] placeholder:text-black/30"
                        />
                      </div>
                      
                      {galleryImageUrl && (
                        <div className="w-full h-40 rounded-[32px] bg-black/5 overflow-hidden border border-black/10">
                          <img src={galleryImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                        </div>
                      )}

                      <button 
                         type="submit"
                         disabled={uploadingGallery} 
                         className="flex items-center justify-center gap-3 w-full py-6 rounded-[28px] bg-brand-blue text-white font-black text-xs tracking-[0.2em] shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                      >
                         {uploadingGallery ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Publishing...
                            </>
                         ) : 'Publish Image'}
                      </button>
                   </form>
                </div>

                <div className="bg-white border border-black/5 p-12 rounded-[56px] relative overflow-hidden shadow-sm">
                   <div className="flex items-center justify-between mb-12">
                     <h4 className="text-sm font-black tracking-[0.2em] text-black/40">Recent uploads</h4>
                     {galleryLoading && <div className="h-4 w-4 border-2 border-black/20 border-t-brand-blue rounded-full animate-spin" />}
                   </div>
                   
                   <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                      {galleryItems.length === 0 && !galleryLoading && (
                        <div className="text-center py-20 text-black/30 font-bold tracking-widest text-xs">No images published yet</div>
                      )}
                      {galleryItems.map(item => (
                        <div key={item.id} className="bg-black/5 border border-transparent p-4 md:p-6 rounded-[24px] md:rounded-[32px] flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-8 group hover:bg-black/10 transition-all">
                           <div className="h-28 w-28 rounded-2xl bg-black/10 object-cover overflow-hidden border border-black/10 shrink-0">
                              <img src={item.image_url} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.category} />
                           </div>
                           <div className="min-w-0 pr-4">
                              <p className="text-sm font-black mb-1 truncate text-[#1D1D1F]">{item.category}</p>
                              <p className="text-[10px] font-black tracking-widest text-black/40 mb-6">Published {new Date(item.created_at).toLocaleDateString()}</p>
                              <div className="flex gap-4">
                                <button onClick={() => handleDeleteGalleryItem(item.id)} className="h-10 w-10 rounded-xl bg-white text-red-500 border border-black/5 shadow-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'carwash' && (
              <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-10">
                <div className="bg-white border border-black/5 p-6 md:p-12 rounded-[32px] md:rounded-[56px] space-y-8 md:space-y-12 shadow-sm">
                   <div>
                      <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-4 text-[#1D1D1F]">Carwash <span className="text-brand-blue ml-2">Transformations</span></h3>
                      <p className="text-black/40 font-bold text-[10px] tracking-[0.2em]">Sector: Automotive detailing</p>
                   </div>
                   
                   <form onSubmit={async (e) => {
                     e.preventDefault();
                     if (!carwashForm.before || !carwashForm.after || !carwashForm.model) return toast.error("Complete all fields");
                     setUploadingCarwash(true);
                     const { error } = await supabase.from('carwash_showcase').insert([{
                       before_url: carwashForm.before,
                       after_url: carwashForm.after,
                       car_model: carwashForm.model
                     }]);
                     if (!error) {
                       toast.success('Transformation published live!');
                       setCarwashForm({ before: '', after: '', model: '' });
                     }
                     setUploadingCarwash(false);
                   }} className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.2em] text-black/40 ml-4">Car model</label>
                        <input 
                          type="text" 
                          value={carwashForm.model}
                          onChange={(e) => setCarwashForm({...carwashForm, model: e.target.value})}
                          placeholder="e.g. Mercedes-Benz G-Wagon"
                          className="w-full pl-6 pr-8 py-5 bg-black/5 border border-black/10 rounded-[32px] outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-bold text-[#1D1D1F]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="relative aspect-video rounded-[32px] overflow-hidden bg-black/5 border border-black/10 group">
                             {carwashForm.before ? (
                               <img src={carwashForm.before} className="h-full w-full object-cover" alt="Before" />
                             ) : (
                               <div className="h-full w-full flex flex-col items-center justify-center text-black/20">
                                  <Camera size={32} strokeWidth={1} />
                                  <p className="text-[10px] font-black mt-2">BEFORE PHOTO</p>
                               </div>
                             )}
                             {uploadingBefore && (
                               <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                  <div className="h-8 w-8 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
                               </div>
                             )}
                             <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <span className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black">CHANGE IMAGE</span>
                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setUploadingBefore(true);
                                  const fileName = `${Date.now()}-before-${file.name}`;
                                  const { data } = await supabase.storage.from('avatars').upload(`carwash/${fileName}`, file);
                                  if (data) {
                                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`carwash/${fileName}`);
                                    setCarwashForm(prev => ({ ...prev, before: publicUrl }));
                                  }
                                  setUploadingBefore(false);
                                }} />
                             </label>
                          </div>
                          <input 
                            type="url" 
                            value={carwashForm.before}
                            onChange={(e) => setCarwashForm({...carwashForm, before: e.target.value})}
                            placeholder="Or paste URL..."
                            className="w-full px-6 py-4 bg-black/5 border border-black/10 rounded-2xl outline-none text-xs font-bold"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="relative aspect-video rounded-[32px] overflow-hidden bg-black/5 border border-black/10 group">
                             {carwashForm.after ? (
                               <img src={carwashForm.after} className="h-full w-full object-cover" alt="After" />
                             ) : (
                               <div className="h-full w-full flex flex-col items-center justify-center text-black/20">
                                  <Camera size={32} strokeWidth={1} />
                                  <p className="text-[10px] font-black mt-2">AFTER PHOTO</p>
                               </div>
                             )}
                             {uploadingAfter && (
                               <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                  <div className="h-8 w-8 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
                               </div>
                             )}
                             <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <span className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black">CHANGE IMAGE</span>
                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setUploadingAfter(true);
                                  const fileName = `${Date.now()}-after-${file.name}`;
                                  const { data } = await supabase.storage.from('avatars').upload(`carwash/${fileName}`, file);
                                  if (data) {
                                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`carwash/${fileName}`);
                                    setCarwashForm(prev => ({ ...prev, after: publicUrl }));
                                  }
                                  setUploadingAfter(false);
                                }} />
                             </label>
                          </div>
                          <input 
                            type="url" 
                            value={carwashForm.after}
                            onChange={(e) => setCarwashForm({...carwashForm, after: e.target.value})}
                            placeholder="Or paste URL..."
                            className="w-full px-6 py-4 bg-black/5 border border-black/10 rounded-2xl outline-none text-xs font-bold"
                          />
                        </div>
                      </div>

                      <button 
                         type="submit"
                         disabled={uploadingCarwash || uploadingBefore || uploadingAfter} 
                         className="flex items-center justify-center gap-3 w-full py-6 rounded-[28px] bg-brand-blue text-white font-black text-xs tracking-[0.2em] shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                      >
                         {uploadingCarwash ? 'Syncing with website...' : 'Publish Transformation'}
                      </button>
                   </form>
                </div>

                <div className="bg-white border border-black/5 p-6 md:p-12 rounded-[32px] md:rounded-[56px] relative overflow-hidden shadow-sm">
                   <div className="flex items-center justify-between mb-8 md:mb-12">
                     <h4 className="text-sm font-black tracking-[0.2em] text-black/40">Recent Magic</h4>
                     {carwashLoading && <div className="h-4 w-4 border-2 border-black/20 border-t-brand-blue rounded-full animate-spin" />}
                   </div>
                   
                   <div className="space-y-6 max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar pr-2 md:pr-4">
                      {carwashItems.length === 0 && !carwashLoading && (
                        <div className="text-center py-10 md:py-20 text-black/30 font-bold tracking-widest text-xs">No transformations yet</div>
                      )}
                      {carwashItems.map(item => (
                        <div key={item.id} className="bg-black/5 border border-transparent p-4 md:p-6 rounded-[24px] md:rounded-[32px] space-y-4 md:space-y-6 group hover:bg-black/10 transition-all">
                           <div className="flex items-center justify-between">
                              <p className="text-sm font-black text-[#1D1D1F] truncate pr-4">{item.car_model}</p>
                              <button 
                                onClick={async () => {
                                  await supabase.from('carwash_showcase').delete().eq('id', item.id);
                                  fetchCarwashItems();
                                  toast.success('Deleted');
                                }}
                                className="h-8 w-8 rounded-lg bg-white text-red-500 border border-black/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                           </div>
                           <div className="grid grid-cols-2 gap-3 md:gap-4">
                              <div className="relative group/img aspect-video">
                                <img src={item.before_url} className="h-full w-full object-cover rounded-xl md:rounded-2xl border border-black/5" alt="Before" />
                                <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[7px] md:text-[8px] font-bold text-white uppercase tracking-widest">Before</span>
                              </div>
                              <div className="relative group/img aspect-video">
                                <img src={item.after_url} className="h-full w-full object-cover rounded-xl md:rounded-2xl border border-brand-blue/20" alt="After" />
                                <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-brand-blue/80 backdrop-blur-md rounded text-[7px] md:text-[8px] font-bold text-white uppercase tracking-widest">After</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'promotions' && (
              <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="bg-white border border-black/5 p-12 rounded-[56px] space-y-12 shadow-sm">
                   <div>
                      <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-4 text-[#1D1D1F]">Manage <span className="text-brand-blue ml-2">Promotions</span></h3>
                      <p className="text-black/40 font-bold text-[10px] tracking-[0.2em]">Sector: Marketing campaigns</p>
                   </div>
                   
                   <form onSubmit={handleAddPromotion} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.2em] text-black/40 ml-4">Campaign title</label>
                        <input 
                          type="text" 
                          value={promoForm.title}
                          onChange={(e) => setPromoForm({...promoForm, title: e.target.value})}
                          placeholder="e.g. Weekend Cyber Grind"
                          className="w-full pl-6 pr-8 py-5 bg-black/5 border border-black/10 rounded-[32px] outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-bold text-[#1D1D1F]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black tracking-[0.2em] text-black/40 ml-4">Offer text</label>
                          <input 
                            type="text" 
                            value={promoForm.offer}
                            onChange={(e) => setPromoForm({...promoForm, offer: e.target.value})}
                            placeholder="e.g. 50% Off"
                            className="w-full pl-6 pr-8 py-5 bg-black/5 border border-black/10 rounded-[32px] outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-bold text-[#1D1D1F]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black tracking-[0.2em] text-black/40 ml-4">Service tag</label>
                          <select 
                            value={promoForm.tag}
                            onChange={(e) => setPromoForm({...promoForm, tag: e.target.value})}
                            className="w-full pl-6 pr-8 py-5 bg-black/5 border border-black/10 rounded-[32px] outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-bold text-[#1D1D1F]"
                          >
                            {GALLERY_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.2em] text-black/40 ml-4">Campaign description</label>
                        <textarea 
                          rows={3}
                          value={promoForm.desc}
                          onChange={(e) => setPromoForm({...promoForm, desc: e.target.value})}
                          placeholder="Describe the offer details..."
                          className="w-full pl-6 pr-8 py-5 bg-black/5 border border-black/10 rounded-[32px] outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-bold text-[#1D1D1F] resize-none"
                        ></textarea>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.2em] text-black/40 ml-4">Poster image url</label>
                        <input 
                          type="url" 
                          value={promoForm.img}
                          onChange={(e) => setPromoForm({...promoForm, img: e.target.value})}
                          placeholder="https://..."
                          className="w-full pl-6 pr-8 py-5 bg-black/5 border border-black/10 rounded-[32px] outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-bold text-[#1D1D1F]"
                        />
                      </div>

                      <button 
                         type="submit"
                         disabled={uploadingPromo} 
                         className="flex items-center justify-center gap-3 w-full py-6 rounded-[28px] bg-brand-blue text-white font-black text-xs tracking-[0.2em] shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                      >
                         {uploadingPromo ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Publishing...
                            </>
                         ) : 'Publish Promotion'}
                      </button>
                   </form>
                </div>

                <div className="bg-white border border-black/5 p-12 rounded-[56px] relative overflow-hidden shadow-sm">
                   <div className="flex items-center justify-between mb-12">
                     <h4 className="text-sm font-black tracking-[0.2em] text-black/40">Active campaigns</h4>
                     {promotionsLoading && <div className="h-4 w-4 border-2 border-black/20 border-t-brand-blue rounded-full animate-spin" />}
                   </div>
                   
                   <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                      {promotions.length === 0 && !promotionsLoading && (
                        <div className="text-center py-20 text-black/30 font-bold tracking-widest text-xs">No active promotions</div>
                      )}
                      {promotions.map(item => (
                        <div key={item.id} className="bg-black/5 border border-transparent p-4 md:p-6 rounded-[24px] md:rounded-[32px] flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-8 group hover:bg-black/10 transition-all">
                           <div className="h-28 w-28 rounded-2xl bg-black/10 object-cover overflow-hidden border border-black/10 shrink-0">
                              <img src={item.img} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                           </div>
                           <div className="min-w-0 flex-grow text-center sm:text-left">
                              <p className="text-sm font-black mb-1 truncate text-[#1D1D1F]">{item.title}</p>
                              <p className="text-[10px] font-black tracking-widest text-brand-blue mb-2">{item.offer}</p>
                              <p className="text-[10px] font-black tracking-widest text-black/40 mb-4 line-clamp-2">{item.desc}</p>
                              <div className="flex gap-4 justify-center sm:justify-start">
                                <button onClick={() => handleDeletePromotion(item.id)} className="h-10 w-10 rounded-xl bg-white text-red-500 border border-black/5 shadow-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{opacity:0, y: 30}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="bg-white border border-black/5 p-12 md:p-20 rounded-[64px] max-w-4xl relative overflow-hidden shadow-2xl shadow-black/[0.02]">
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand-blue/10 blur-[100px] rounded-full" />
                <div className="relative z-10 space-y-16">
                   <div className="space-y-4">
                      <h3 className="text-2xl md:text-3xl font-black leading-tight tracking-tighter text-[#1D1D1F]">Site <span className="text-brand-blue ml-2">Settings</span></h3>
                      <p className="text-lg text-black/50 font-medium max-w-md">Configure global variables and external connections for the Junction landing page.</p>
                   </div>
                   
                    <div className="space-y-10 group">
                      <div className="space-y-4">
                         <label className="text-xs font-bold text-black/40 ml-2">Hero background image</label>
                         
                         {heroBg && (
                           <div className="relative w-full h-48 rounded-[32px] overflow-hidden border border-black/10 mb-4 group/img">
                             <img src={heroBg} alt="Hero Background" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-4">
                               <button 
                                 onClick={() => setHeroBg('')}
                                 className="h-12 w-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                                 title="Delete Background"
                               >
                                 <Trash2 size={20} />
                               </button>
                             </div>
                           </div>
                         )}

                         <div className="flex flex-col sm:flex-row gap-4">
                           <div className="relative flex-grow">
                              <ImageIcon size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-blue" />
                              <input 
                                type="text" 
                                value={heroBg}
                                onChange={(e) => setHeroBg(e.target.value)}
                                placeholder="Enter an image URL..."
                                className="w-full pl-16 pr-8 py-5 bg-black/5 border border-black/10 rounded-[28px] outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/20 transition-all font-bold text-[#1D1D1F] placeholder:text-black/30 text-sm"
                              />
                           </div>
                           <label className={cn(
                             "flex items-center justify-center gap-2 px-8 py-5 rounded-[28px] bg-white border border-black/10 font-bold text-sm cursor-pointer hover:bg-black/5 transition-all shadow-sm",
                             uploadingBg && "opacity-50 pointer-events-none"
                           )}>
                              {uploadingBg ? <RefreshCw size={18} className="animate-spin text-brand-blue" /> : <Camera size={18} className="text-brand-blue" />}
                              <span>{uploadingBg ? 'Uploading...' : 'Upload Image'}</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleUploadBg} disabled={uploadingBg} />
                           </label>
                         </div>
                      </div>

                      <button 
                        onClick={saveSettings}
                        disabled={saveLoading}
                        className="flex items-center gap-4 px-14 py-6 rounded-full bg-brand-blue text-white font-black text-xs tracking-[0.3em] shadow-2xl shadow-brand-blue/40 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50"
                      >
                         {saveLoading ? (
                           <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                           </>
                         ) : (
                           <>
                              <Save size={20} />
                              Save Luxury Settings
                           </>
                         )}
                      </button>
                    </div>
                </div>
              </motion.div>
            )}

            {['promotions', 'team', 'scheduler', 'logistics'].includes(activeTab) && (
              <motion.div initial={{opacity:0, scale: 0.9}} animate={{opacity:1, scale: 1}} exit={{opacity:0}} className="bg-white border border-black/5 p-24 md:p-32 rounded-[64px] text-center flex flex-col items-center justify-center min-h-[600px] shadow-sm">
                 <div className="h-48 w-48 rounded-full bg-brand-blue/5 flex items-center justify-center mb-16 relative">
                    <Layers size={96} className="text-brand-blue/30" />
                    <div className="absolute inset-0 rounded-full border border-brand-blue/20 animate-ping" />
                 </div>
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 italic text-[#1D1D1F]">Coming Soon</h2>
                 <p className="text-black/40 font-bold max-w-sm mx-auto text-[10px] tracking-[0.2em] leading-loose">
                   This module is actively being developed. Check back soon for new administrative features.
                 </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
