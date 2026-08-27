import React from 'react';
import { MessageCircle, Share2, Phone, CheckCircle2 } from 'lucide-react';

export const WhatsAppOrderButton = ({ product }) => {
  if (!product) return null;

  // Use artisan's saved phone from database profile (product.owner_phone)
  const rawPhone = product.owner_phone || '';
  const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, '') : '';
  const hasPhone = Boolean(cleanPhone);

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

  const whatsappOrderUrl = hasPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderMessage)}` : null;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="card" style={{ padding: '24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #dcfce7', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#25D366', color: '#ffffff', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#064e3b', margin: 0 }}>WhatsApp Direct Ordering</h3>
            <p style={{ fontSize: '0.85rem', color: '#166534', margin: '2px 0 0 0' }}>Connect directly with the artisan on WhatsApp</p>
          </div>
        </div>

        {hasPhone ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#14532d', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>Verified Artisan WhatsApp: <strong>+{cleanPhone}</strong></span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
            <span>Artisan Phone Pending (Set in Profile)</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {hasPhone ? (
          <a
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: '1 1 240px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#25D366',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.95rem',
              padding: '12px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(37,211,102,0.3)',
            }}
          >
            <MessageCircle size={20} />
            <span>Order Directly via WhatsApp</span>
          </a>
        ) : (
          <div
            style={{
              flex: '1 1 240px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#e5e7eb',
              color: '#6b7280',
              fontWeight: '600',
              fontSize: '0.9rem',
              padding: '12px 24px',
              borderRadius: '12px',
            }}
          >
            <MessageCircle size={20} />
            <span>Artisan Phone Not Set Yet</span>
          </div>
        )}

        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#ffffff',
            color: '#166534',
            border: '1px solid #86efac',
            fontWeight: '600',
            fontSize: '0.9rem',
            padding: '12px 20px',
            borderRadius: '12px',
            textDecoration: 'none',
          }}
        >
          <Share2 size={18} />
          <span>Share Listing</span>
        </a>
      </div>
    </div>
  );
};
