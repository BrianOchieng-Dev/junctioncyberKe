import { motion } from 'motion/react';
import { Users, MessageCircle, Share2, Lock } from 'lucide-react';

interface CommunityProps {
  isAuthenticated: boolean;
  onJoin: () => void;
}

export default function Community({ isAuthenticated, onJoin }: CommunityProps) {
  return (
    <section id="community" className="py-12 px-4 overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Join the <span className="text-brand-blue">Community</span>
          </h2>
          <p className="text-black/40 text-lg max-w-2xl mx-auto">
            Connect with other professionals, share insights, and get exclusive access to our premium hubs.
          </p>
        </div>

        <div className="relative">
          {!isAuthenticated && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-md bg-white/20 rounded-[40px] border border-white/40">
              <div className="h-16 w-16 rounded-full bg-brand-blue flex items-center justify-center text-white mb-6 shadow-xl animate-bounce">
                <Lock size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Members Only Area</h3>
              <p className="text-black/60 mb-8 max-w-sm text-center">Sign in with your Supabase account to unlock the community feed and exclusive perks.</p>
              <button 
                onClick={onJoin}
                className="rounded-full bg-[#1D1D1F] px-10 py-4 font-bold text-white shadow-xl hover:scale-105 transition-transform"
              >
                Sign In to Unlock
              </button>
            </div>
          )}

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${!isAuthenticated ? 'opacity-20 pointer-events-none' : ''}`}>
            {[
              { icon: MessageCircle, title: "Private Lounge", desc: "Real-time discussions with industry experts in our premium cyber channels." },
              { icon: Users, title: "Executive Networking", desc: "Discover and connect with like-minded members from our multi-business hub." },
              { icon: Share2, title: "Resource Vault", desc: "Exclusive templates, guides, and priority booking slots available only to members." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-10 hover:border-brand-blue/30 transition-all"
              >
                <div className="h-14 w-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6">
                  <feature.icon size={28} />
                </div>
                <h4 className="text-xl font-bold mb-4">{feature.title}</h4>
                <p className="text-black/50 leading-relaxed">{feature.desc}</p>
                <div className="mt-8 pt-8 border-t border-black/5 flex items-center justify-between">
                   <span className="text-xs font-bold text-brand-blue tracking-widest">ACTIVE NOW</span>
                   <div className="flex -space-x-2">
                      {[1,2,3].map(j => (
                        <div key={j} className="h-8 w-8 rounded-full border-2 border-white bg-black/5 overflow-hidden">
                           <img src={`https://i.pravatar.cc/150?u=${j+10}`} alt="User" />
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
