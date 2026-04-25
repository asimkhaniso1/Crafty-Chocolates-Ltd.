import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-choco text-cream/60 py-20 border-t border-choco">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <img 
                src="https://storage.googleapis.com/static.6sd3zosursi3hp5e554img.asia-southeast1.run.app/logo_c8f85be0.png" 
                alt="Logo" 
                className="h-16 w-16 object-contain brightness-0 invert"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-2xl font-black tracking-tighter uppercase text-cream">
                  Crafty<br/>Chocolates
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest leading-loose font-bold">
                Engineering the world's most sophisticated chocolate experiences since 2020.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gold/20 rounded blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative border border-cream/20 px-3 py-2 text-[10px] font-black tracking-[0.2em] rounded bg-choco flex flex-col items-center justify-center min-w-[100px] border-gold/30">
                    <span className="text-gold mb-1">HACCP</span>
                    <span className="text-[7px] opacity-60">CERTIFIED</span>
                  </div>
                </div>
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gold/20 rounded blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative border border-cream/20 px-3 py-2 text-[10px] font-black tracking-[0.2em] rounded bg-choco flex flex-col items-center justify-center min-w-[100px] border-gold/30">
                    <span className="text-gold mb-1">ISO 9001</span>
                    <span className="text-[7px] opacity-60">QUALITY MGMT</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <Instagram className="hover:text-gold cursor-pointer transition-colors" size={18} />
              <Facebook className="hover:text-gold cursor-pointer transition-colors" size={18} />
              <Twitter className="hover:text-gold cursor-pointer transition-colors" size={18} />
            </div>
          </div>

          <div>
            <h4 className="text-cream text-[10px] uppercase tracking-[0.3em] font-black mb-8">Studio Labs</h4>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest font-bold">
              <li className="hover:text-gold cursor-pointer transition-colors">The 3D Sculptory</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Precision Pours</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Single Origin Sourcing</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Bespoke Inquiries</li>
            </ul>
          </div>

          <div>
            <h4 className="text-cream text-[10px] uppercase tracking-[0.3em] font-black mb-8">Navigation</h4>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest font-bold">
              <li className="hover:text-gold cursor-pointer transition-colors">Current Collection</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Client Archive</li>
              <li className="hover:text-gold cursor-pointer transition-colors">The Process</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Sustainability</li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-cream text-[10px] uppercase tracking-[0.3em] font-black mb-8">The Foundry</h4>
            <ul className="space-y-6 text-[10px] uppercase tracking-widest font-bold">
              <li className="flex items-start gap-4">
                <MapPin size={14} className="text-gold shrink-0" /> 
                <span>123 Artisan Alley,<br/>Foundry District</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={14} className="text-gold shrink-0" /> 
                <span>+1 (555) 012-CHOC</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={14} className="text-gold shrink-0" /> 
                <span>hello@craftychocolates.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 text-[9px] flex flex-col md:flex-row justify-between items-center gap-6 uppercase tracking-[0.4em] font-black">
          <span>&copy; 2020 - 2024 Crafty Chocolates. All Rights Reserved.</span>
          <div className="flex flex-wrap justify-center gap-8 text-cream/40">
            <span className="hover:text-gold cursor-pointer transition-colors">Ethical Standards</span>
            <span className="hover:text-gold cursor-pointer transition-colors">Privacy Laboratory</span>
            <span className="hover:text-gold cursor-pointer transition-colors">Shipping Logistics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
