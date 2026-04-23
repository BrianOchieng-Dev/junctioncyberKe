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
  Droplets,
  Workflow,
  ChevronLeft
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
  user_id?: string;
  phone?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const { user, profile, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [heroBg, setHeroBg] = useState('');
  const [groupPhoto, setGroupPhoto] = useState('');
  const [aboutSlogan, setAboutSlogan] = useState('');
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
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [uploadingCarwash, setUploadingCarwash] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(GALLERY_CATEGORIES[0]);
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Team State
  const [team, setTeam] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', role: '', image: '' });
  const [uploadingMember, setUploadingMember] = useState(false);

  // Promotions State
  const [promotions, setPromotions] = useState<any[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState(false);
  const [promoForm, setPromoForm] = useState({
    title: '',
    offer: '',
    desc: '',
    img: '',
    tag: GALLERY_CATEGORIES[0],
    deadline: ''
  });
  const [uploadingPromo, setUploadingPromo] = useState(false);

  // Inbox States
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchInquiries();
    fetchGalleryItems();
    fetchPromotions();
    fetchCarwashItems();
    fetchTeamMembers();

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!selectedInquiryId) {
      setMessages([]);
      return;
    }

    fetchMessages(selectedInquiryId);

    const channel = supabase
      .channel(`inquiry_chats_${selectedInquiryId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inquiry_messages', filter: `inquiry_id=eq.${selectedInquiryId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedInquiryId]);

  const fetchMessages = async (id: string) => {
    setMessagesLoading(true);
    const { data } = await supabase
      .from('inquiry_messages')
      .select('*')
      .eq('inquiry_id', id)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
    setMessagesLoading(false);
  };

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
    }
  };

  const handleReply = async () => {
    if (!selectedInquiry || !replyText.trim()) return;
    
    setReplyLoading(true);
    try {
      if (selectedInquiry.status === 'unread') {
        await markAsRead(selectedInquiry.id);
      }

      const { error: msgError } = await supabase
        .from('inquiry_messages')
        .insert([{
          inquiry_id: selectedInquiry.id,
          message: replyText,
          is_admin: true,
          sender_id: user?.id
        }]);
      
      if (msgError) throw msgError;

      if (selectedInquiry.user_id) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: selectedInquiry.user_id,
            message: `Admin replied: "${replyText.substring(0, 60)}..."`,
            type: 'inquiry_reply',
            is_read: false,
            created_at: new Date().toISOString()
          }]);
      }
      
      setReplyText('');
      toast.success('Reply sent!');
    } catch (err: any) {
      toast.error('Failed to send reply: ' + err.message);
    } finally {
      setReplyLoading(false);
    }
  };

  const selectedInquiry = inquiries.find(i => i.id === selectedInquiryId);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        data.forEach(item => {
          if (item.key === 'hero_bg') setHeroBg(item.value);
          if (item.key === 'group_photo') setGroupPhoto(item.value);
          if (item.key === 'about_slogan') setAboutSlogan(item.value);
        });
      }
    } catch (err) {
      console.warn('Settings not found');
    }
  };

  const saveSettings = async () => {
    try {
      setSaveLoading(true);
      const { error } = await supabase
        .from('site_settings')
        .upsert([
          { key: 'hero_bg', value: heroBg },
          { key: 'group_photo', value: groupPhoto },
          { key: 'about_slogan', value: aboutSlogan }
        ], { onConflict: 'key' });
      
      if (error) throw error;
      toast.success('Settings updated!');
    } catch (err: any) {
      toast.error('Failed: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUploadBg = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingBg(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const { data, error } = await supabase.storage.from('avatars').upload(`settings/hero-${Date.now()}-${file.name}`, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path);
      setHeroBg(publicUrl);
      toast.success('Uploaded!');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploadingBg(false);
    }
  };

  const fetchGalleryItems = async () => {
    setGalleryLoading(true);
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (data) setGalleryItems(data);
    setGalleryLoading(false);
  };

  const handleAddGalleryItem = async (e: any) => {
    e.preventDefault();
    if (!galleryImageUrl) return toast.error("Provide image URL");
    setUploadingGallery(true);
    const { error } = await supabase.from('gallery').insert([{ category: selectedCategory, image_url: galleryImageUrl }]);
    if (!error) {
      toast.success('Added!');
      setGalleryImageUrl('');
      fetchGalleryItems();
    }
    setUploadingGallery(false);
  };

  const handleDeleteGalleryItem = async (id: string) => {
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (!error) {
      toast.success('Deleted');
      fetchGalleryItems();
    }
  };

  const fetchPromotions = async () => {
    setPromotionsLoading(true);
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    if (data) setPromotions(data);
    setPromotionsLoading(false);
  };

  const handleAddPromotion = async (e: any) => {
    e.preventDefault();
    setUploadingPromo(true);
    const { error } = await supabase.from('promotions').insert([promoForm]);
    if (!error) {
      toast.success('Published!');
      setPromoForm({ title: '', offer: '', desc: '', img: '', tag: GALLERY_CATEGORIES[0], deadline: '' });
      fetchPromotions();
    }
    setUploadingPromo(false);
  };

  const handleDeletePromotion = async (id: string) => {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (!error) {
      toast.success('Deleted');
      fetchPromotions();
    }
  };

  const fetchTeamMembers = async () => {
    setTeamLoading(true);
    const { data } = await supabase.from('team_members').select('*').order('created_at', { ascending: false });
    if (data) setTeam(data);
    setTeamLoading(false);
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingMember(true);
    const { error } = await supabase.from('team_members').insert([teamForm]);
    if (!error) {
      toast.success('Added!');
      setTeamForm({ name: '', role: '', image: '' });
      fetchTeamMembers();
    }
    setUploadingMember(false);
  };

  const handleDeleteTeamMember = async (id: string) => {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (!error) {
      toast.success('Member removed');
      fetchTeamMembers();
    }
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
    <div className="mesh-gradient min-h-screen flex flex-col md:flex-row text-[#1D1D1F] font-body selection:bg-brand-blue/30 selection:text-white overflow-hidden relative">
      <ToastContainer theme="light" position="bottom-right" aria-label="Notifications" />

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-[70] h-screen w-72 flex flex-col p-6 transition-transform duration-500",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="glass-card h-full w-full p-6 flex flex-col border-white/20 shadow-2xl bg-white/60">
          <div className="flex items-center justify-between mb-12 px-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-brand-blue flex items-center justify-center text-white">
                <Workflow size={20} className="rotate-45" />
              </div>
              <span className="font-black tracking-tighter text-xl font-heading text-[#1D1D1F]">Junction <span className="text-brand-blue">OS</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-black/40"><Plus size={24} className="rotate-45" /></button>
          </div>

          <nav className="flex-grow space-y-2 overflow-y-auto no-scrollbar">
            <Link to="/" className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-black/40 hover:text-brand-blue hover:bg-brand-blue/5 mb-6 group transition-all font-heading">
              <Home size={18} />
              <span className="font-bold text-[10px] uppercase tracking-widest">Exit Terminal</span>
            </Link>
            
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as Tab); setIsSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-500 group relative overflow-hidden",
                  activeTab === item.id 
                    ? "text-brand-blue bg-brand-blue/5 shadow-[inset_0_0_20px_rgba(0,122,255,0.05)]" 
                    : "text-black/40 hover:text-[#1D1D1F] hover:bg-black/5"
                )}
              >
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="pill" 
                    className="absolute left-0 w-1 h-6 bg-brand-blue rounded-r-full shadow-[0_0_15px_rgba(0,122,255,0.6)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="shrink-0"
                >
                  <item.icon size={18} />
                </motion.div>
                <span className="font-bold text-sm font-heading tracking-tight">{item.label}</span>
                {item.id === 'inbox' && unreadCount > 0 && (
                  <span className="ml-auto h-5 w-5 bg-semantic-red text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <button onClick={() => signOut()} className="mt-8 flex items-center gap-4 px-4 py-4 rounded-2xl text-semantic-red hover:bg-red-50 font-heading">
            <LogOut size={20} />
            <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-grow h-screen flex flex-col overflow-hidden relative">
        <div className="flex-grow flex flex-col overflow-hidden p-4 md:p-8 lg:p-12">
          <header className="sticky top-0 z-50 flex flex-col sm:flex-row justify-between mb-8 gap-4 items-start sm:items-center bg-white/20 backdrop-blur-xl p-6 -mx-4 md:-mx-8 lg:-mx-12 rounded-b-[40px] border-b border-white/30 shadow-2xl shadow-black/5">
            <div>
              <div className="flex items-center gap-2 text-brand-blue font-black text-[9px] tracking-[0.4em] font-heading uppercase opacity-80">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-blue animate-pulse shadow-[0_0_10px_rgba(0,122,255,0.8)]" /> Terminal Core 3.1
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight capitalize font-heading text-[#1D1D1F] drop-shadow-sm">{activeTab}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden xl:flex items-center gap-4 px-5 py-2 glass-card bg-white/40 border-white/40 shadow-xl">
                <div className="text-right">
                  <p className="text-[8px] font-black text-black/40 uppercase font-heading tracking-widest">Authorized</p>
                  <p className="text-[10px] font-bold text-[#1D1D1F]">{user?.email}</p>
                </div>
                <div className="h-9 w-9 rounded-xl overflow-hidden ring-2 ring-white shadow-lg">
                  <img src={profile?.avatar_url || "https://i.pravatar.cc/100"} className="w-full h-full object-cover" alt="Profile" />
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden h-12 w-12 glass-card bg-white/60 border-white/60 flex items-center justify-center text-brand-blue shadow-xl"><LayoutDashboard size={22} /></button>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto no-scrollbar pb-6 px-1">
            <div className="max-w-7xl mx-auto h-full">
              <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.02}} className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                  {/* High Density Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Revenue', val: '1.2M', icon: RefreshCw },
                      { label: 'Orders', val: '1.2k', icon: Layers },
                      { label: 'Growth', val: '24%', icon: Megaphone },
                      { label: 'Status', val: 'Live', icon: Workflow }
                    ].map((stat, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="glass-card p-5 bg-white/30 border-white/40 flex flex-col justify-between hover:bg-white/50 transition-all cursor-pointer group shadow-lg shadow-black/5"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-[8px] font-black tracking-widest text-black/30 uppercase font-heading">{stat.label}</p>
                          <stat.icon size={12} className="text-brand-blue/40 group-hover:text-brand-blue transition-colors" />
                        </div>
                        <p className="text-xl font-black font-heading text-[#1D1D1F] mt-2">{stat.val}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Liquid Hero Card */}
                  <div className="flex-grow glass-card bg-gradient-to-br from-brand-blue/90 via-brand-blue to-purple-600/90 p-8 text-white relative overflow-hidden group shadow-2xl shadow-brand-blue/20">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          <span className="text-[9px] font-black tracking-widest uppercase">System Operational</span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black font-heading italic uppercase leading-none tracking-tighter">Liquid Terminal <br/> Interface</h3>
                      </div>
                      <div className="flex items-end justify-between">
                        <p className="text-white/60 text-xs font-medium max-w-[240px] leading-relaxed">Centralized synchronization of all active Junction service domains.</p>
                        <button className="bg-white text-brand-blue px-8 py-4 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-xl">Secure Sync</button>
                      </div>
                    </div>
                    {/* Animated Liquid Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl -ml-20 -mb-20 animate-float" />
                  </div>
                </div>

                <div className="space-y-6 flex flex-col">
                  {/* Team Liquid Card */}
                  <div className="flex-grow glass-card bg-white/30 border-white/40 p-8 flex flex-col items-center justify-center text-center group hover:bg-white/50 transition-all shadow-xl">
                    <div className="relative mb-6">
                      <div className="h-20 w-20 rounded-[32px] bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-brand-blue/5">
                        <Users size={32} className="text-brand-blue" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-semantic-green rounded-full border-4 border-white shadow-lg animate-pulse" />
                    </div>
                    <h4 className="text-2xl font-black font-heading tracking-tight">Team Hub</h4>
                    <p className="text-[9px] font-black text-black/30 uppercase mt-2 tracking-widest leading-loose">Personnel Sync <br/> Active</p>
                    <div className="mt-8 flex -space-x-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-9 w-9 rounded-full border-2 border-white overflow-hidden shadow-md group-hover:translate-y-[-2px] transition-transform" style={{ transitionDelay: `${i * 50}ms` }}>
                          <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions Liquid Card */}
                  <div className="glass-card bg-[#1D1D1F] p-8 text-white group shadow-2xl shadow-black/20 overflow-hidden relative">
                    <div className="relative z-10">
                      <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white/40 mb-6 font-heading">Quick Access</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-brand-blue transition-all">
                          <Megaphone size={18} />
                          <span className="text-[8px] font-black uppercase tracking-widest">Alert</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-brand-blue transition-all">
                          <Settings size={18} />
                          <span className="text-[8px] font-black uppercase tracking-widest">Config</span>
                        </button>
                      </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-all duration-1000"><Workflow size={120} /></div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'inbox' && (
              <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0}} className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-280px)]">
                <div className={cn("glass-card bg-white/60 p-6 flex flex-col", selectedInquiryId && "hidden lg:flex")}>
                  <h3 className="text-[10px] font-black tracking-[0.3em] text-black/30 uppercase mb-8 font-heading px-2">Communications</h3>
                  <div className="space-y-3 overflow-y-auto no-scrollbar">
                    {inquiries.map(inv => (
                      <button key={inv.id} onClick={() => { setSelectedInquiryId(inv.id); if (inv.status === 'unread') markAsRead(inv.id); }} className={cn("w-full p-5 rounded-3xl border transition-all text-left flex gap-4", selectedInquiryId === inv.id ? "bg-brand-blue text-white border-brand-blue" : "bg-white/40 border-white/60 hover:bg-white")}>
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", selectedInquiryId === inv.id ? "bg-white/20" : "bg-brand-blue/10 text-brand-blue")}><User size={20} /></div>
                        <div className="min-w-0 flex-grow">
                          <p className="font-black text-sm truncate font-heading">{inv.name}</p>
                          <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{inv.service || 'General'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className={cn("lg:col-span-3 glass-card bg-white/60 flex flex-col overflow-hidden", !selectedInquiryId && "hidden lg:flex")}>
                  {selectedInquiry ? (
                    <>
                      <div className="p-8 bg-white/40 border-b border-white/60 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button onClick={() => setSelectedInquiryId(null)} className="lg:hidden"><ChevronLeft /></button>
                          <div>
                            <h4 className="text-xl font-black font-heading uppercase italic">{selectedInquiry.name}</h4>
                            <p className="text-[10px] font-black text-brand-blue uppercase">{selectedInquiry.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow p-8 space-y-6 overflow-y-auto custom-scrollbar">
                        <div className="flex gap-4 max-w-[85%]">
                          <div className="p-6 rounded-[32px] rounded-tl-none bg-white border border-white/60 text-sm font-medium">{selectedInquiry.message}</div>
                        </div>
                        {messages.map(msg => (
                          <div key={msg.id} className={cn("flex gap-4 max-w-[85%]", msg.is_admin ? "ml-auto flex-row-reverse" : "")}>
                            <div className={cn("p-6 rounded-[32px] text-sm font-medium", msg.is_admin ? "bg-brand-blue text-white rounded-tr-none" : "bg-white border border-white/60 rounded-tl-none")}>{msg.message}</div>
                          </div>
                        ))}
                      </div>
                      <div className="p-8 bg-white/40 border-t border-white/60">
                        <div className="flex gap-4 bg-white p-2 rounded-full border border-white shadow-xl">
                          <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply()} placeholder="Draft response..." className="flex-grow bg-transparent outline-none px-6 text-sm font-bold" />
                          <button onClick={handleReply} disabled={replyLoading || !replyText.trim()} className="h-12 px-10 rounded-full bg-brand-blue text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-50">Send</button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-20"><MessageSquare size={80} className="mb-8" /><p className="font-black font-heading uppercase tracking-widest text-sm">Select a thread to begin</p></div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'showcase' && (
              <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.05}} className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full min-h-0">
                <div className="glass-card bg-white/20 backdrop-blur-xl p-8 space-y-8 shadow-xl border-white/30">
                  <h3 className="text-2xl font-black font-heading italic uppercase">Deploy <span className="text-brand-blue not-italic">Asset</span></h3>
                  <form onSubmit={handleAddGalleryItem} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-black/30 ml-4">Domain</label>
                      <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full px-6 py-4 bg-white/40 border border-white rounded-full font-bold outline-none appearance-none cursor-pointer text-xs">
                        {GALLERY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-black/30 ml-4">Intelligence URL</label>
                      <input value={galleryImageUrl} onChange={e => setGalleryImageUrl(e.target.value)} placeholder="https://..." className="w-full px-6 py-4 bg-white/40 border border-white rounded-full font-bold outline-none text-xs" />
                    </div>
                    <button type="submit" disabled={uploadingGallery} className="w-full py-5 rounded-full bg-brand-blue text-white font-black text-[9px] uppercase tracking-[0.3em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 font-heading">Synchronize Asset</button>
                  </form>
                </div>
                <div className="glass-card bg-white/20 backdrop-blur-xl p-8 overflow-y-auto no-scrollbar shadow-xl border-white/30">
                  <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-black/30 mb-6 px-2">Asset Terminal</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {galleryItems.map(item => (
                      <motion.div 
                        key={item.id} 
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="p-3 bg-white/40 border border-white rounded-2xl flex gap-4 group cursor-pointer shadow-sm"
                      >
                        <img src={item.image_url} className="h-16 w-16 rounded-xl object-cover shadow-lg" alt="Gallery" />
                        <div className="flex-grow flex flex-col justify-center">
                          <p className="font-black text-xs font-heading uppercase tracking-tight">{item.category}</p>
                          <p className="text-[8px] font-bold text-black/30 mt-1 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => handleDeleteGalleryItem(item.id)} className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center self-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><Trash2 size={12} /></button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'carwash' && (
              <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.05}} className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full min-h-0">
                <div className="glass-card bg-white/20 backdrop-blur-xl p-8 space-y-6 shadow-xl border-white/30">
                  <h3 className="text-2xl font-black font-heading italic uppercase">Magic <span className="text-brand-blue not-italic">Sync</span></h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if(!carwashForm.model || !carwashForm.before || !carwashForm.after) return toast.error("Fill all fields");
                    setUploadingCarwash(true);
                    const { error } = await supabase.from('carwash_showcase').insert([{
                      car_model: carwashForm.model,
                      before_url: carwashForm.before,
                      after_url: carwashForm.after
                    }]);
                    if(!error) { toast.success("Deployed!"); setCarwashForm({model:'', before:'', after:''}); fetchCarwashItems(); }
                    setUploadingCarwash(false);
                  }} className="space-y-4">
                    <input value={carwashForm.model} onChange={e => setCarwashForm({...carwashForm, model: e.target.value})} placeholder="Car Model ID" className="w-full px-6 py-4 bg-white/40 border border-white rounded-full font-bold outline-none text-xs" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="aspect-video bg-black/5 rounded-2xl overflow-hidden border border-white relative group shadow-inner">
                          {carwashForm.before && <img src={carwashForm.before} className="w-full h-full object-cover" alt="Before" />}
                          <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 bg-black/40 transition-all">
                            <span className="bg-white text-black px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest">Source</span>
                            <input type="file" className="hidden" onChange={async (e) => {
                               const file = e.target.files?.[0]; if(!file) return;
                               setUploadingBefore(true);
                               const { data } = await supabase.storage.from('avatars').upload(`carwash/b-${Date.now()}`, file);
                               if(data) { const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path); setCarwashForm(prev => ({...prev, before: publicUrl})); }
                               setUploadingBefore(false);
                            }} />
                          </label>
                        </div>
                        <input value={carwashForm.before} onChange={e => setCarwashForm({...carwashForm, before: e.target.value})} placeholder="URL 1" className="w-full px-4 py-2 bg-white/20 border border-white rounded-xl text-[8px] font-bold outline-none" />
                      </div>
                      <div className="space-y-2">
                        <div className="aspect-video bg-black/5 rounded-2xl overflow-hidden border border-white relative group shadow-inner">
                          {carwashForm.after && <img src={carwashForm.after} className="w-full h-full object-cover" alt="After" />}
                          <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 bg-black/40 transition-all">
                            <span className="bg-white text-black px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest">Target</span>
                            <input type="file" className="hidden" onChange={async (e) => {
                               const file = e.target.files?.[0]; if(!file) return;
                               setUploadingAfter(true);
                               const { data } = await supabase.storage.from('avatars').upload(`carwash/a-${Date.now()}`, file);
                               if(data) { const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path); setCarwashForm(prev => ({...prev, after: publicUrl})); }
                               setUploadingAfter(false);
                            }} />
                          </label>
                        </div>
                        <input value={carwashForm.after} onChange={e => setCarwashForm({...carwashForm, after: e.target.value})} placeholder="URL 2" className="w-full px-4 py-2 bg-white/20 border border-white rounded-xl text-[8px] font-bold outline-none" />
                      </div>
                    </div>
                    <button type="submit" disabled={uploadingCarwash} className="w-full py-5 rounded-full bg-brand-blue text-white font-black text-[9px] uppercase tracking-[0.3em] shadow-xl disabled:opacity-50 font-heading">Deploy Transformation</button>
                  </form>
                </div>
                <div className="glass-card bg-white/20 backdrop-blur-xl p-8 overflow-y-auto no-scrollbar shadow-xl border-white/30">
                  <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-black/30 mb-6 px-2">Magic Terminal</h4>
                  <div className="grid grid-cols-1 gap-6">
                    {carwashItems.map(item => (
                      <motion.div 
                        key={item.id} 
                        whileHover={{ scale: 1.01 }}
                        className="bg-white/40 border border-white p-4 rounded-3xl space-y-4 group shadow-sm hover:bg-white/60 transition-all"
                      >
                        <div className="flex justify-between items-center px-2">
                          <p className="font-black text-xs font-heading uppercase tracking-tight">{item.car_model}</p>
                          <button onClick={async () => { await supabase.from('carwash_showcase').delete().eq('id', item.id); fetchCarwashItems(); }} className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><Trash2 size={14} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative rounded-xl overflow-hidden border border-white shadow-md aspect-video">
                            <img src={item.before_url} className="w-full h-full object-cover" alt="Before" />
                            <div className="absolute inset-0 bg-black/20" />
                          </div>
                          <div className="relative rounded-xl overflow-hidden border border-brand-blue/30 shadow-md aspect-video">
                            <img src={item.after_url} className="w-full h-full object-cover" alt="After" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'promotions' && (
              <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.05}} className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full min-h-0">
                <div className="glass-card bg-white/20 backdrop-blur-xl p-8 space-y-6 shadow-xl border-white/30">
                  <h3 className="text-2xl font-black font-heading italic uppercase">Launch <span className="text-brand-blue not-italic">Promo</span></h3>
                  <form onSubmit={handleAddPromotion} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input value={promoForm.title} onChange={e => setPromoForm({...promoForm, title: e.target.value})} placeholder="Title" className="w-full px-6 py-4 bg-white/40 border border-white rounded-full font-bold outline-none text-xs" />
                      <input value={promoForm.offer} onChange={e => setPromoForm({...promoForm, offer: e.target.value})} placeholder="Offer" className="w-full px-6 py-4 bg-white/40 border border-white rounded-full font-bold outline-none text-brand-blue text-xs" />
                    </div>
                    <textarea value={promoForm.desc} onChange={e => setPromoForm({...promoForm, desc: e.target.value})} placeholder="Intelligence..." className="w-full px-6 py-4 bg-white/40 border border-white rounded-3xl font-bold outline-none min-h-[100px] resize-none text-xs" />
                    <div className="grid grid-cols-2 gap-4">
                      <input value={promoForm.img} onChange={e => setPromoForm({...promoForm, img: e.target.value})} placeholder="Asset URL" className="w-full px-6 py-4 bg-white/40 border border-white rounded-full font-bold outline-none text-xs" />
                      <input value={promoForm.deadline} onChange={e => setPromoForm({...promoForm, deadline: e.target.value})} placeholder="Deadline" className="w-full px-6 py-4 bg-white/40 border border-white rounded-full font-bold outline-none text-xs" />
                    </div>
                    <button type="submit" disabled={uploadingPromo} className="w-full py-5 rounded-full bg-brand-blue text-white font-black text-[9px] uppercase tracking-[0.3em] shadow-xl disabled:opacity-50 font-heading">Synchronize Campaign</button>
                  </form>
                </div>
                <div className="glass-card bg-white/20 backdrop-blur-xl p-8 overflow-y-auto no-scrollbar shadow-xl border-white/30">
                  <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-black/30 mb-6 px-2">Campaign Hub</h4>
                  <div className="space-y-4">
                    {promotions.map(p => (
                      <motion.div 
                        key={p.id} 
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-white/40 border border-white rounded-3xl flex gap-6 group transition-all shadow-sm"
                      >
                        <img src={p.img} className="h-24 w-24 rounded-2xl object-cover shadow-lg" alt="Promo" />
                        <div className="flex-grow space-y-1 justify-center flex flex-col">
                          <p className="font-black text-xs uppercase tracking-tight font-heading">{p.title}</p>
                          <p className="text-[8px] font-black text-brand-blue uppercase">{p.offer}</p>
                          <p className="text-[8px] font-bold text-black/40 line-clamp-2">{p.desc}</p>
                          <div className="pt-2">
                            <button onClick={() => handleDeletePromotion(p.id)} className="h-7 w-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'team' && (
              <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.05}} className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full min-h-0">
                <div className="glass-card bg-white/20 backdrop-blur-xl p-8 space-y-6 shadow-xl border-white/30">
                  <h3 className="text-2xl font-black font-heading italic uppercase">Team <span className="text-brand-blue not-italic">Sync</span></h3>
                  <form onSubmit={handleAddTeamMember} className="space-y-4">
                    <input value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} placeholder="Identity" className="w-full px-6 py-4 bg-white/40 border border-white rounded-full font-bold outline-none text-xs" />
                    <input value={teamForm.role} onChange={e => setTeamForm({...teamForm, role: e.target.value})} placeholder="Operational Role" className="w-full px-6 py-4 bg-white/40 border border-white rounded-full font-bold outline-none text-xs" />
                    <div className="flex gap-4">
                      <input value={teamForm.image} onChange={e => setTeamForm({...teamForm, image: e.target.value})} placeholder="Visual ID URL" className="flex-grow px-6 py-4 bg-white/40 border border-white rounded-full font-bold outline-none text-xs" />
                      <label className="h-14 w-14 bg-white/60 backdrop-blur-md rounded-2xl border border-white flex items-center justify-center cursor-pointer text-brand-blue shadow-lg hover:bg-white transition-all">
                        <Camera size={20} />
                        <input type="file" className="hidden" onChange={async (e) => {
                           const file = e.target.files?.[0]; if(!file) return;
                           const { data } = await supabase.storage.from('avatars').upload(`team/${Date.now()}`, file);
                           if(data) { const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path); setTeamForm(prev => ({...prev, image: publicUrl})); }
                        }} />
                      </label>
                    </div>
                    <button type="submit" disabled={uploadingMember} className="w-full py-5 rounded-full bg-brand-blue text-white font-black text-[9px] uppercase tracking-[0.3em] shadow-xl disabled:opacity-50 font-heading">Deploy Personnel</button>
                  </form>
                </div>
                <div className="glass-card bg-white/20 backdrop-blur-xl p-8 overflow-y-auto no-scrollbar shadow-xl border-white/30">
                  <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-black/30 mb-6 px-2">Personnel Roster</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {team.map(m => (
                      <motion.div 
                        key={m.id} 
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="p-4 bg-white/40 border border-white rounded-3xl flex items-center gap-4 group shadow-sm hover:bg-white/60 transition-all cursor-pointer"
                      >
                        <img src={m.image} className="h-16 w-16 rounded-2xl object-cover shadow-lg" alt="Team" />
                        <div className="flex-grow">
                          <p className="font-black text-xs uppercase tracking-tight font-heading">{m.name}</p>
                          <p className="text-[8px] font-black text-brand-blue uppercase">{m.role}</p>
                        </div>
                        <button onClick={() => handleDeleteTeamMember(m.id)} className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><Trash2 size={12} /></button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.02}} className="glass-card bg-white/20 backdrop-blur-xl p-12 md:p-16 max-w-4xl mx-auto space-y-12 shadow-2xl border-white/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <h3 className="text-3xl font-black font-heading italic uppercase">Core <span className="text-brand-blue not-italic">Sync</span></h3>
                <div className="space-y-8 relative z-10">
                  <div className="space-y-4">
                    <label className="text-[8px] font-black uppercase tracking-[0.4em] text-black/30 ml-4">Hero Interface Asset</label>
                    <div className="flex gap-4">
                      <input value={heroBg} onChange={e => setHeroBg(e.target.value)} placeholder="Secure Image URL..." className="flex-grow px-8 py-5 bg-white/40 border border-white rounded-full font-bold outline-none text-xs" />
                      <label className="px-8 py-5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-black text-[8px] uppercase tracking-[0.3em] cursor-pointer hover:bg-brand-blue hover:text-white transition-all font-heading shadow-lg">
                        Upload <input type="file" className="hidden" onChange={handleUploadBg} />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[8px] font-black uppercase tracking-[0.4em] text-black/30 ml-4">Brand Narrative (Slogan)</label>
                    <textarea value={aboutSlogan} onChange={e => setAboutSlogan(e.target.value)} className="w-full px-8 py-6 bg-white/40 border border-white rounded-[40px] font-bold outline-none min-h-[120px] resize-none text-sm" />
                  </div>
                  <button onClick={saveSettings} disabled={saveLoading} className="w-full py-6 rounded-full bg-brand-blue text-white font-black text-[9px] uppercase tracking-[0.4em] shadow-2xl disabled:opacity-50 font-heading">Synchronize Environment Settings</button>
                </div>
              </motion.div>
            )}

            {['scheduler', 'logistics'].includes(activeTab) && (
              <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.05}} className="glass-card bg-white/20 backdrop-blur-xl p-24 text-center flex flex-col items-center justify-center h-full min-h-[400px] shadow-2xl border-white/30">
                <div className="h-32 w-32 rounded-full bg-brand-blue/5 flex items-center justify-center mb-8 animate-pulse border border-brand-blue/10 shadow-inner"><Layers size={48} className="text-brand-blue/20" /></div>
                <h3 className="text-3xl font-black font-heading italic uppercase">Sector <span className="text-brand-blue not-italic">Restricted</span></h3>
                <p className="text-[8px] font-black text-black/30 uppercase tracking-[0.3em] max-w-sm mt-4">Secure environment deployment in progress. <br/> Access level: restricted.</p>
              </motion.div>
            )}
          </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
