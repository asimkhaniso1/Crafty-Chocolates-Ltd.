// Re-export real product data extracted from the original Drupal site.
export { PRODUCTS, CATEGORIES, FORMATS, EVENTS } from './data/products';

// Contact details
export const PHONE_DISPLAY = '021-34973151';
export const PHONE_TEL = '+922134973151';
// WhatsApp click-to-chat: international format, no '+' or dashes.
export const WHATSAPP_NUMBER = '923332527370';
// Local Pakistani format for showing in UI / footer / cards.
export const WHATSAPP_DISPLAY = '0333-2527370';
export const WHATSAPP_MESSAGE = "Hello Crafty Chocolates, I'd like to enquire about your products.";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export function formatPrice(amount: number, currency: string = 'PKR'): string {
  if (currency === 'PKR') return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
  if (currency === 'USD') return `$${amount.toFixed(2)}`;
  return `${currency} ${amount.toFixed(2)}`;
}
