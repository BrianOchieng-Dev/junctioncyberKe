import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthGateProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGate({ children, requireAdmin = false }: AuthGateProps) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    // If not logged in, redirect to home or show a message
    // For now, let's redirect to home
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Access restricted UI for non-admins
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFD] p-6 text-center text-[#1D1D1F]">
        <div className="glass-card p-12 max-w-md bg-white border border-black/5 shadow-2xl rounded-[40px]">
          <Settings size={48} className="mx-auto text-red-500 mb-6" />
          <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Access Restricted</h2>
          <p className="text-black/40 font-medium mb-8">This mainframe sector is reserved for Junction Admins only.</p>
          <Link to="/" className="inline-block px-8 py-3 bg-brand-blue text-white rounded-full font-bold shadow-lg shadow-brand-blue/20 transition-transform active:scale-95">
            Return to Base Station
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
