import { Phone } from 'lucide-react';
import { WHATSAPP_URL, PHONE_TEL, PHONE_DISPLAY } from '../constants';

export default function WhatsAppFloat() {
  return (
    <div className="fixed bottom-6 right-6 z-[55] flex flex-col items-end gap-3">
      <a
        href={`tel:${PHONE_TEL}`}
        aria-label={`Call us at ${PHONE_DISPLAY}`}
        className="group flex items-center gap-3"
      >
        <span className="hidden md:inline-block bg-choco text-cream text-[10px] uppercase tracking-[0.25em] font-black px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          Call {PHONE_DISPLAY}
        </span>
        <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-choco shadow-xl shadow-black/20 hover:scale-110 transition-transform">
          <Phone size={22} strokeWidth={2.5} className="text-cream" />
        </span>
      </a>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group flex items-center gap-3"
      >
        <span className="hidden md:inline-block bg-choco text-cream text-[10px] uppercase tracking-[0.25em] font-black px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          Chat with us
        </span>
        <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-xl shadow-black/20 hover:scale-110 transition-transform">
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
          <svg
            viewBox="0 0 32 32"
            className="w-7 h-7 fill-white relative"
            aria-hidden="true"
          >
            <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.788 2.722.788.817 0 2.15-.515 2.495-1.318.13-.302.158-.66.158-.99 0-.215-2.106-1.39-2.49-1.39zm-3.105 6.317h-.014c-1.747 0-3.45-.515-4.898-1.49l-3.42.974 1.02-3.302a8.708 8.708 0 0 1-1.69-5.16c.014-4.806 3.94-8.732 8.762-8.732 4.81 0 8.745 3.926 8.745 8.748 0 4.81-3.945 8.762-8.505 8.962zm0-19.262C9.585 4.26 5.226 8.62 5.22 13.99c0 1.72.46 3.387 1.323 4.86l-1.405 5.137 5.225-1.376a10.073 10.073 0 0 0 4.823 1.232h.014c5.685 0 10.55-4.642 10.55-10.027.024-3.97-1.747-7.063-5.156-9.236-1.434-.9-3.4-1.36-5.578-1.36z" />
          </svg>
        </span>
      </a>
    </div>
  );
}
