import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Save, Camera, LogOut, Car, Star, Award } from 'lucide-react';
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
  const [errors, setErrors] = useState<{ phone?: string; address?: string }>({});

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

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

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
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success('Avatar uploaded! Click Save to confirm.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const newErrors: { phone?: string; address?: string } = {};
    
    // Phone validation (Kenya format or international)
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (profile.phone && !phoneRegex.test(profile.phone)) {
      newErrors.phone = 'Please enter a valid phone number (e.g., +2547... or 07...)';
    }
    
    // Address validation (basic length check)
    if (profile.address && profile.address.length < 5) {
      newErrors.address = 'Please provide a more detailed address (min 5 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      setSaving(true);
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleUpdate} 
      className="space-y-6 p-6 relative"
    >
      <button 
        type="button"
        onClick={handleLogout}
        className="absolute top-0 right-6 p-3 rounded-2xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm group"
        title="Logout"
      >
        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="relative group">
          <div className="h-24 w-24 rounded-full bg-black/5 overflow-hidden ring-4 ring-brand-blue/10 transition-all group-hover:ring-brand-blue/20 flex items-center justify-center">
            {uploading ? (
              <div className="scale-75">
                <LoadingSpinner />
              </div>
            ) : (
              <img 
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                alt="Avatar" 
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-brand-blue text-white rounded-full shadow-lg scale-90 group-hover:scale-100 transition-all cursor-pointer hover:bg-brand-blue/90">
            <Camera size={16} />
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={uploadAvatar} 
              disabled={uploading}
            />
          </label>
        </div>
        <div className="text-center">
           <h3 className="font-bold text-lg text-[#1D1D1F]">{profile.full_name || 'Premium Member'}</h3>
           <p className="text-xs text-black/40 font-medium">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-black/40 ml-2">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
            <input 
              type="text" 
              value={profile.full_name || ''} 
              onChange={e => setProfile({...profile, full_name: e.target.value})}
              className="w-full pl-12 pr-4 py-3.5 bg-black/5 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium border border-transparent focus:border-brand-blue/10"
              placeholder="Your professional name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-black/40 ml-2">Phone Number</label>
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
            <input 
              type="tel" 
              value={profile.phone || ''} 
              onChange={e => {
                setProfile({...profile, phone: e.target.value});
                if (errors.phone) setErrors({...errors, phone: undefined});
              }}
              className={cn(
                "w-full pl-12 pr-4 py-3.5 bg-black/5 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium border border-transparent focus:border-brand-blue/10",
                errors.phone && "border-red-500/50 bg-red-50/50"
              )}
              placeholder="+254..."
            />
          </div>
          {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-2 animate-shake">{errors.phone}</p>}
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-black/40 ml-2">Primary Address</label>
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
            <input 
              type="text" 
              value={profile.address || ''} 
              onChange={e => {
                setProfile({...profile, address: e.target.value});
                if (errors.address) setErrors({...errors, address: undefined});
              }}
              className={cn(
                "w-full pl-12 pr-4 py-3.5 bg-black/5 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium border border-transparent focus:border-brand-blue/10",
                errors.address && "border-red-500/50 bg-red-50/50"
              )}
              placeholder="Nairobi, Kenya"
            />
          </div>
          {errors.address && <p className="text-[10px] text-red-500 font-bold ml-2 animate-shake">{errors.address}</p>}
        </div>

        <div className="md:col-span-2 glass-card p-4 bg-brand-blue/5 border-brand-blue/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-black/40">Member Loyalty Points</p>
              <p className="text-xl font-black text-brand-blue">{profile.loyalty_points || 0} <span className="text-xs text-black/40">points</span></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-black/40">Status Tier</p>
            <p className="text-xs font-bold text-brand-blue">
              {(profile.loyalty_points || 0) > 1000 ? 'Platinum Elite' : (profile.loyalty_points || 0) > 500 ? 'Gold Select' : 'Silver Member'}
            </p>
          </div>
        </div>
      </div>

      <button 
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-blue py-4 font-bold text-white shadow-xl shadow-brand-blue/20 transition-all hover:scale-[1.02] active:scale-95 mt-4 disabled:opacity-50"
      >
        {saving ? (
          <div className="scale-50 h-6 w-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Save size={20} />
            <span>Save Luxury Profile</span>
          </div>
        )}
      </button>
    </motion.form>
  );
}
