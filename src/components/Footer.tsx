import { Instagram, Facebook, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { WHATSAPP_URL, WHATSAPP_DISPLAY, PHONE_DISPLAY, PHONE_TEL } from '../constants';

export default function Footer() {
  return (
    <footer className="bg-choco text-cream/60 py-20 border-t border-choco">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-16 w-16 object-contain"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-2xl font-black tracking-tighter uppercase text-cream">
                  Crafty<br />Chocolates
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest leading-loose font-bold">
                Personalized chocolate gifts, engineered in Karachi since 2020. Send chocolates anywhere in Pakistan.
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
              <a href="https://www.instagram.com/craftychocolates._com/" target="_blank" rel="noopener noreferrer" aria-label="Crafty Chocolates on Instagram">
                <Instagram className="hover:text-gold cursor-pointer transition-colors" size={18} />
              </a>
              <a href="https://www.facebook.com/craftychoc/" target="_blank" rel="noopener noreferrer" aria-label="Crafty Chocolates on Facebook">
                <Facebook className="hover:text-gold cursor-pointer transition-colors" size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-cream text-[10px] uppercase tracking-[0.3em] font-black mb-8">Studio Labs</h4>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest font-bold">
              <li><a href="#custom-molds" className="hover:text-gold transition-colors">The 3D Sculptory</a></li>
              <li><a href="#custom-molds" className="hover:text-gold transition-colors">Precision Pours</a></li>
              <li><a href="#our-story" className="hover:text-gold transition-colors">Single Origin Sourcing</a></li>
              <li><a href="#custom-molds" className="hover:text-gold transition-colors">Bespoke Inquiries</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-cream text-[10px] uppercase tracking-[0.3em] font-black mb-8">Navigation</h4>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest font-bold">
              <li><a href="#collections" className="hover:text-gold transition-colors">Current Collection</a></li>
              <li><a href="#testimonials" className="hover:text-gold transition-colors">Client Archive</a></li>
              <li><a href="#custom-molds" className="hover:text-gold transition-colors">The Process</a></li>
              <li><a href="#our-story" className="hover:text-gold transition-colors">Sustainability</a></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-cream text-[10px] uppercase tracking-[0.3em] font-black mb-8">The Foundry</h4>
            <ul className="space-y-6 text-[10px] uppercase tracking-widest font-bold">
              <li className="flex items-start gap-4">
                <MapPin size={14} className="text-gold shrink-0" />
                <span>123 Artisan Alley,<br />Foundry District</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={14} className="text-gold shrink-0" />
                <a href={`tel:${PHONE_TEL}`} className="hover:text-gold transition-colors">{PHONE_DISPLAY}</a>
              </li>
              <li className="flex items-center gap-4">
                <MessageCircle size={14} className="text-gold shrink-0" />
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp: {WHATSAPP_DISPLAY}
                </a>
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
