import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="py-10 px-4 relative mt-10">
      {/* Footer Top Border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-brand-blue" />
            <span className="text-lg font-bold tracking-tighter uppercase text-[#1D1D1F]">THE JUNCTION</span>
          </div>
          <p className="text-black/40 text-sm leading-relaxed">
            Leading the way in premium multi-business solutions. 
            Experience the future of integrated lifestyle services.
          </p>
          <div className="flex gap-4">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="h-11 w-11 flex items-center justify-center rounded-full bg-black/5 border border-black/10 text-black/50 hover:bg-brand-blue hover:text-white transition-all shadow-sm">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[#1D1D1F] font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm text-black/40">
            <li><a href="#" className="hover:text-brand-blue transition-colors">Digital Solutions</a></li>
            <li><a href="#" className="hover:text-brand-blue transition-colors">Grooming Services</a></li>
            <li><a href="#" className="hover:text-brand-blue transition-colors">Automotive Care</a></li>
            <li><a href="#" className="hover:text-brand-blue transition-colors">Eco-Laundry</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#1D1D1F] font-bold mb-6">HQ Locations</h4>
          <ul className="space-y-4 text-sm text-black/40">
            <li className="flex gap-2">
              <MapPin size={16} className="text-brand-blue flex-shrink-0" />
              <span>123 Junction Hub, Silicon Valley Avenue, Tech Suite 500</span>
            </li>
            <li className="flex gap-2">
              <Phone size={16} className="text-brand-blue flex-shrink-0" />
              <span>+1 (555) 000-1234</span>
            </li>
            <li className="flex gap-2">
              <Mail size={16} className="text-brand-blue flex-shrink-0" />
              <span>experience@junctioncyber.com</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#1D1D1F] font-bold mb-6">Newsletter</h4>
          <p className="text-sm text-black/40 mb-4">Get the latest updates on our premium services.</p>
          <div className="flex glass-card p-1 border-black/5">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-transparent border-none focus:ring-0 text-sm px-4 flex-grow text-[#1D1D1F]"
            />
            <button className="bg-[#1D1D1F] text-white px-4 py-2 rounded-2xl text-xs font-bold hover:bg-brand-blue transition-all">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-4 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-black/30 tracking-widest uppercase font-medium">
        <span>© 2026 THE JUNCTION CYBER. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-8">
          <a href="#" className="hover:text-[#1D1D1F] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#1D1D1F] transition-colors">Terms of Service</a>
          <a href="/admin" className="hover:text-brand-blue transition-colors border-l border-black/10 pl-8">Admin Access</a>
        </div>
      </div>
    </footer>
  );
}
