import { motion } from 'motion/react';
import { Workflow } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export default function LoadingSpinner({ fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="relative h-24 w-24">
        {/* Core Orbital Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[1px] border-brand-blue/20 border-t-brand-blue shadow-[0_0_20px_rgba(0,122,255,0.1)]"
        />
        
        {/* Secondary Inner Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border-[1px] border-brand-blue/10 border-b-brand-blue/40"
        />
        
        {/* Refractive Glass Orb */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8] 
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-12 w-12 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl flex items-center justify-center rotate-45 relative overflow-hidden group"
          >
            {/* Specular Shine */}
            <motion.div 
              animate={{ x: [-40, 40] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent -rotate-45"
            />
            <Workflow size={20} className="text-brand-blue -rotate-45" />
          </motion.div>
        </div>

        {/* Floating Particles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 4 + i, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, delay: i * 0.5 }
            }}
            className="absolute inset-0"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-brand-blue/40 absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_8px_rgba(0,122,255,0.4)]" />
          </motion.div>
        ))}
      </div>
      
      <div className="space-y-3 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-black/40 font-heading">
            Initializing <span className="text-brand-blue">Mainframe</span>
          </h3>
          <motion.div 
            animate={{ scaleX: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-blue/40 to-transparent origin-center"
          />
        </motion.div>
        
        <p className="text-[9px] font-bold text-black/20 uppercase tracking-[0.2em] font-body">Establishing Secure Connection</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#FBFBFD] flex items-center justify-center overflow-hidden">
        {/* Dynamic Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [-20, 20, -20],
              y: [-20, 20, -20]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-brand-blue/[0.03] blur-[140px] rounded-full" 
          />
          <motion.div 
             animate={{ 
              scale: [1.2, 1, 1.2],
              x: [20, -20, 20],
              y: [20, -20, 20]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-purple-500/[0.02] blur-[140px] rounded-full" 
          />
        </div>
        {content}
      </div>
    );
  }

  return content;
}
