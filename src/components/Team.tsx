import { motion } from 'motion/react';
import { Linkedin, Twitter, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Member {
  id: string;
  name: string;
  role: string;
  image: string;
}

export default function Team() {
  const [team, setTeam] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
    
    const channel = supabase
      .channel('public_team')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
        fetchTeam();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTeam = async () => {
    const { data } = await supabase.from('team_members').select('*').order('created_at', { ascending: true });
    if (data) setTeam(data);
    setLoading(false);
  };
  return (
    <section id="team" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.span 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             className="text-xs font-bold tracking-[0.3em] uppercase text-brand-blue mb-4 block"
          >
            The Custodians
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-[#1D1D1F]">
            Meet the <span className="text-black/40 italic">Visionaries</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-[40px] bg-black/5 animate-pulse" />
            ))
          ) : team.length === 0 ? (
            <div className="col-span-full py-20 text-center text-black/20 font-black tracking-widest text-xs uppercase">No team members published yet</div>
          ) : (
            team.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group glass-card p-4 hover:border-brand-blue/40 transition-all flex flex-col h-full"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[4/5] mb-6">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-6 pb-8">
                    <div className="flex gap-4">
                      <a href="#" className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-brand-blue transition-all">
                        <Linkedin size={18} />
                      </a>
                      <a href="#" className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-brand-blue transition-all">
                        <Twitter size={18} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="px-2 pb-4">
                  <h3 className="text-xl font-bold mb-1 text-[#1D1D1F] group-hover:text-brand-blue transition-colors font-heading">{member.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#1D1D1F]/30 font-heading">{member.role}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
