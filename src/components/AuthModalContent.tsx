import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Facebook, Chrome, Eye, EyeOff, User, Lock, Mail, MapPin, RefreshCw, Phone, Camera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Valid Kenyan phone number required'),
  location: z.string().min(2, 'Location is required')
});

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { label: '', color: '' };
    if (pass.length < 8) return { label: 'Too Short', color: 'text-red-500' };
    
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    const mediumRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    
    if (strongRegex.test(pass)) return { label: 'Strong', color: 'text-green-500' };
    if (mediumRegex.test(pass)) return { label: 'Medium', color: 'text-yellow-500' };
    return { label: 'Weak', color: 'text-orange-500' };
  };

  const validatePassword = (pass: string, userEmail: string) => {
    if (pass.length < 8) return 'Password must be at least 8 characters long';
    
    // Admin specific rule
    if (userEmail === 'junctioncyber23@gmail.com' && pass !== 'Sentinel@2026') {
      return 'Invalid password for Admin account';
    }
    return null;
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        registerSchema.parse({ email, password, fullName, phone, location });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError((err as any).errors[0].message);
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName || 'Anonymous Driver',
              location: location
            }
          }
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          // Create profile record
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            phone: phone,
            address: location,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          });
          if (profileError) console.error('Profile creation error:', profileError);
        }
        toast.success('Registration successful!');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || `${provider} login failed`);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `temp/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('Image uploaded!');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 p-1 glass-card border-black/5 bg-black/5 rounded-2xl mb-8">
        <button 
          onClick={() => { setIsLogin(true); setError(null); }}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-brand-blue shadow-md' : 'text-black/40'}`}
        >
          {t('sign_in')}
        </button>
        <button 
          onClick={() => { setIsLogin(false); setError(null); }}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-brand-blue shadow-md' : 'text-black/40'}`}
        >
          {t('register')}
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative group">
              <div className="h-20 w-20 rounded-full bg-black/5 overflow-hidden ring-4 ring-brand-blue/10 flex items-center justify-center">
                {uploading ? (
                  <RefreshCw className="animate-spin text-brand-blue" />
                ) : (
                  <img 
                    src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || 'temp'}`} 
                    alt="Avatar" 
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-brand-blue text-white rounded-full shadow-lg cursor-pointer hover:bg-brand-blue/90">
                <Camera size={14} />
                <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
              </label>
            </div>
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Upload Profile Photo</p>
          </div>
        )}
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-black/40 ml-2">{t('full_name')}</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
              <input 
                type="text" 
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-transparent bg-black/5 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
              />
            </div>
          </div>
        )}
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-black/40 ml-2">{t('prof_phone')}</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
              <input 
                type="tel" 
                placeholder="0712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={!isLogin}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-transparent bg-black/5 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
              />
            </div>
          </div>
        )}
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-black/40 ml-2">{t('location')}</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
              <input 
                type="text" 
                placeholder="Nairobi, Kenya"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required={!isLogin}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-transparent bg-black/5 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
              />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <label className="text-xs font-bold text-black/40 ml-2">{t('email_addr')}</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
            <input 
              type="email" 
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-transparent bg-black/5 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-black/40 ml-2">{t('password')}</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="w-full pl-12 pr-12 py-4 rounded-2xl border-transparent bg-black/5 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 transition-all font-medium" 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-brand-blue transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Strength</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${getPasswordStrength(password).color}`}>
                {getPasswordStrength(password).label}
              </span>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full mt-4 h-16 flex items-center justify-center relative overflow-hidden group"
        >
          {loading ? (
             <div className="flex items-center gap-3">
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <span className="font-bold tracking-wider">{isLogin ? 'Authenticating...' : 'Creating Account...'}</span>
             </div>
          ) : (
            <div className="flex items-center gap-2">
              {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
              <span className="font-bold">{isLogin ? t('log_in') : t('register')}</span>
            </div>
          )}
        </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5"></div></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-black/30">{t('or_continue_with')}</span></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleOAuth('facebook')}
          className="flex items-center justify-center gap-2 rounded-2xl border border-black/5 py-3 hover:bg-black/5 transition-all font-semibold"
        >
          <Facebook size={18} className="text-[#1877F2]" /> Facebook
        </button>
        <button 
          onClick={() => handleOAuth('google')}
          className="flex items-center justify-center gap-2 rounded-2xl border border-black/5 py-3 hover:bg-black/5 transition-all font-semibold"
        >
          <Chrome size={18} /> Google
        </button>
      </div>
    </div>
  );
}
