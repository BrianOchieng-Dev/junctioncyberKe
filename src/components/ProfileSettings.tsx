import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Save, Camera, LogOut, Car, Star, Award, MessageSquare, Ticket as TicketIcon, Download, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '../lib/utils';
import LoadingSpinner from './LoadingSpinner';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  avatar_url: string;
  loyalty_points?: number;
}

export default function ProfileSettings({ user, onClose }: { user: any, onClose: () => void }) {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'messages' | 'tickets'>('profile');
  const [userInquiries, setUserInquiries] = useState<any[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [inquiryMessages, setInquiryMessages] = useState<any[]>([]);
  const [userBookings, setUserBookings] = useState<any[]>([]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      onClose();
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const fetchUserInquiries = async () => {
    const { data } = await supabase.from('inquiries').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) {
      setUserInquiries(data);
      if (data.length > 0 && !selectedInquiryId) setSelectedInquiryId(data[0].id);
    }
  };

  const fetchUserBookings = async () => {
    const { data } = await supabase.from('bookings').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (data) setUserBookings(data);
  };

  const fetchInquiryMessages = async (id: string) => {
    const { data } = await supabase.from('inquiry_messages').select('*').eq('inquiry_id', id).order('created_at', { ascending: true });
    if (data) setInquiryMessages(data);
  };

  useEffect(() => {
    if (activeTab === 'messages') fetchUserInquiries();
    if (activeTab === 'tickets') fetchUserBookings();
  }, [activeTab]);

  useEffect(() => {
    if (selectedInquiryId) {
      fetchInquiryMessages(selectedInquiryId);
      const channel = supabase.channel(`user_chat_${selectedInquiryId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inquiry_messages', filter: `inquiry_id=eq.${selectedInquiryId}` }, (payload) => {
          setInquiryMessages(prev => [...prev, payload.new]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedInquiryId]);

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
    if (user) getProfile();
  }, [user]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('You must select an image to upload.');
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const updatedProfile = { ...profile, avatar_url: publicUrl };
      setProfile(updatedProfile);
      await supabase.from('profiles').upsert({ id: user.id, ...updatedProfile, updated_at: new Date().toISOString() });
      toast.success('Avatar updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast.success('Luxury profile synchronized!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="flex flex-col h-[600px] overflow-hidden">
      <div className="flex items-center gap-2 md:gap-4 px-4 md:px-6 py-4 border-b border-black/5 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('profile')} className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2.5 rounded-xl transition-all whitespace-nowrap", activeTab === 'profile' ? "bg-brand-blue text-white shadow-lg" : "text-black/40 hover:bg-black/5")}>Profile</button>
        <button onClick={() => setActiveTab('messages')} className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2.5 rounded-xl transition-all whitespace-nowrap", activeTab === 'messages' ? "bg-brand-blue text-white shadow-lg" : "text-black/40 hover:bg-black/5")}>Messages</button>
        <button onClick={() => setActiveTab('tickets')} className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2.5 rounded-xl transition-all whitespace-nowrap", activeTab === 'tickets' ? "bg-brand-blue text-white shadow-lg" : "text-black/40 hover:bg-black/5")}>My Tickets</button>
        <button onClick={handleLogout} className="ml-auto p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all"><LogOut size={18} /></button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar">
        {activeTab === 'profile' && (
          <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleUpdate} className="p-6 space-y-6">
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-black/5 overflow-hidden ring-4 ring-brand-blue/10 flex items-center justify-center">
                  {uploading ? <LoadingSpinner /> : <img src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="h-full w-full object-cover" />}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-brand-blue text-white rounded-full shadow-lg cursor-pointer hover:bg-brand-blue/90"><Camera size={16} /><input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} /></label>
              </div>
              <div className="text-center"><h3 className="font-bold text-lg">{profile.full_name || 'Premium Member'}</h3><p className="text-xs text-black/40">{user.email}</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-2">Full Name</label><div className="relative"><User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" /><input type="text" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-black/5 rounded-2xl outline-none font-bold text-xs" /></div></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-2">Phone Number</label><div className="relative"><Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" /><input type="tel" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-black/5 rounded-2xl outline-none font-bold text-xs" /></div></div>
              <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-2">Primary Address</label><div className="relative"><MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" /><input type="text" value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-black/5 rounded-2xl outline-none font-bold text-xs" /></div></div>
            </div>
            <button disabled={saving} className="w-full py-5 rounded-full bg-brand-blue font-black text-[9px] uppercase tracking-[0.3em] text-white shadow-xl mt-4">{saving ? 'Synchronizing...' : 'Save Luxury Profile'}</button>
          </motion.form>
        )}

        {activeTab === 'messages' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-1/3 border-r border-black/5 overflow-y-auto no-scrollbar p-4 space-y-3 bg-black/[0.01]">
              {userInquiries.map(inq => (
                <button key={inq.id} onClick={() => setSelectedInquiryId(inq.id)} className={cn("w-full text-left p-4 rounded-3xl transition-all border", selectedInquiryId === inq.id ? "bg-brand-blue/5 border-brand-blue/20 shadow-sm" : "bg-white border-transparent shadow-sm opacity-60 hover:opacity-100")}>
                  <p className="font-black text-[8px] uppercase tracking-widest text-brand-blue mb-1">{inq.service}</p>
                  <p className="text-[10px] font-bold line-clamp-1">{inq.message}</p>
                </button>
              ))}
            </div>
            <div className="flex-grow p-6 flex flex-col bg-white overflow-y-auto no-scrollbar">
              {selectedInquiryId ? (
                <div className="space-y-4">
                  {inquiryMessages.map(msg => (
                    <div key={msg.id} className={cn("flex flex-col", msg.is_admin ? "items-start" : "items-end")}>
                      <div className={cn("max-w-[85%] p-4 rounded-[24px] text-[11px] font-bold shadow-sm", msg.is_admin ? "bg-black/5 text-black rounded-tl-none" : "bg-brand-blue text-white rounded-tr-none")}>{msg.message}</div>
                      <p className="text-[7px] font-black text-black/20 uppercase mt-2 tracking-widest px-2">{msg.is_admin ? 'Operational Support' : 'Sent Inquiry'}</p>
                    </div>
                  ))}
                </div>
              ) : <div className="h-full flex flex-col items-center justify-center opacity-20"><MessageSquare size={48} className="mb-4" /><p className="text-[10px] font-black uppercase tracking-[0.4em]">Select Thread</p></div>}
            </div>
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 space-y-6">
            {userBookings.map(book => (
              <div key={book.id} className="relative group">
                <div className={cn(
                  "glass-card p-6 border-dashed border-2 flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden",
                  book.status === 'approved' ? "border-brand-blue/30 bg-brand-blue/[0.02]" : "border-black/10 bg-black/[0.02] grayscale"
                )}>
                  <div className="flex items-center gap-6">
                    <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-xl", book.status === 'approved' ? "bg-brand-blue" : "bg-black/20")}>
                      <TicketIcon size={32} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em] mb-1">{book.service} Pass</p>
                      <h4 className="text-lg font-black uppercase tracking-tight">{book.status === 'approved' ? 'Active Ticket' : 'Pending Verification'}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-black/40"><Calendar size={12} /> {book.date}</div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-black/40"><Clock size={12} /> {book.time}</div>
                      </div>
                      <p className="text-[7px] font-black text-brand-blue uppercase tracking-widest mt-4 animate-pulse">Important: Present this ticket at the counter</p>
                    </div>
                  </div>
                  {book.status === 'approved' && (
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                      <Download size={16} /> Print Ticket
                    </button>
                  )}
                </div>
                {book.status === 'approved' && <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-r border-black/5" />}
                {book.status === 'approved' && <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-l border-black/5" />}
              </div>
            ))}
            {userBookings.length === 0 && (
               <div className="h-64 flex flex-col items-center justify-center opacity-20 text-center">
                  <TicketIcon size={48} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">No active tickets found</p>
               </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
