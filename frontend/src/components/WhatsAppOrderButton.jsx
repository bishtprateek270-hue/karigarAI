import React from 'react';
import { MessageCircle, Share2, Phone, CheckCircle2 } from 'lucide-react';

export const WhatsAppOrderButton = ({ product }) => {
  if (!product) return null;

  // Use artisan's saved phone from database profile (product.owner_phone) or fallback
  const rawPhone = product.owner_phone || localStorage.getItem('karigar_whatsapp_phone') || '919876543210';
  const cleanPhone = rawPhone.replace(/\D/g, '');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const formattedPrice = product.suggested_price
    ? `₹${parseFloat(product.suggested_price).toLocaleString('en-IN')}`
    : 'Contact for Price';

  // Construct Pre-filled Order Message
  const orderMessage = `Namaste! 🙏 I am interested in purchasing your handcrafted item listed on KarigarAI:

🛍️ *Product:* ${product.title}
💰 *Price:* ${formattedPrice}
🧶 *Material:* ${product.material || 'Handcrafted Material'}
🎨 *Craft Type:* ${product.craft_type || 'Artisan Craft'}
🔗 *Product Link:* ${currentUrl}

Is this product available for order?`;

  const shareMessage = `Check out this authentic handcrafted craft on KarigarAI! ✨

🛍️ *${product.title}*
💰 Price: ${formattedPrice}
🔗 View Listing: ${currentUrl}`;

  const whatsappOrderUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderMessage)}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-emerald-200/60">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#25D366] text-white rounded-xl shadow-sm">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-950 font-serif">WhatsApp Direct Ordering</h3>
            <p className="text-xs text-emerald-700">Connect directly with the artisan on WhatsApp</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Verified Artisan WhatsApp:</span>
          <span className="font-mono font-bold">+{cleanPhone}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <a
          href={whatsappOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-6 py-3 rounded-xl shadow-sm text-sm transition-all hover:shadow-md"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Order Directly via WhatsApp</span>
        </a>

        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-semibold px-5 py-3 rounded-xl text-sm transition-all shadow-sm"
        >
          <Share2 className="w-4 h-4 text-emerald-600" />
          <span>Share Listing</span>
        </a>
      </div>
    </div>
  );
};
