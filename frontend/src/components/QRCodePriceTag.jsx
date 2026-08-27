import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Tag, Sparkles } from 'lucide-react';

export const QRCodePriceTag = ({ product }) => {
  const printRef = useRef(null);

  if (!product) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const formattedPrice = product.suggested_price
    ? `₹${parseFloat(product.suggested_price).toLocaleString('en-IN')}`
    : 'Ask for Price';

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Price Tag - ${product.title}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #fcfbf9;
            }
            .tag-card {
              width: 320px;
              border: 2px dashed #b45309;
              border-radius: 16px;
              padding: 24px;
              background: #ffffff;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            .brand-header {
              font-size: 14px;
              font-weight: 700;
              letter-spacing: 2px;
              color: #92400e;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .subtitle {
              font-size: 10px;
              color: #78350f;
              margin-bottom: 16px;
              text-transform: uppercase;
            }
            .product-title {
              font-size: 16px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 12px;
              line-height: 1.3;
            }
            .qr-container {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 16px 0;
              padding: 12px;
              background: #fffbeb;
              border-radius: 12px;
              border: 1px solid #fef3c7;
            }
            .price-badge {
              font-size: 24px;
              font-weight: 800;
              color: #92400e;
              margin-top: 12px;
            }
            .meta-text {
              font-size: 11px;
              color: #6b7280;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="tag-card">
            <div class="brand-header">✨ KarigarAI</div>
            <div class="subtitle">Handcrafted Product Tag</div>
            <div class="product-title">${product.title}</div>
            <div class="qr-container">
              ${printContent.querySelector('.qr-wrapper')?.innerHTML || ''}
            </div>
            <div class="price-badge">${formattedPrice}</div>
            <div class="meta-text">Crafted from ${product.material || 'Natural Materials'} • ${product.craft_type || 'Artisan Handcraft'}</div>
            <div class="meta-text" style="font-size:9px; margin-top:12px;">Scan QR to view digital catalog & artisan story</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #fef3c7', borderRadius: '16px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #fef3c7', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>Exhibition QR Code Price Tag</h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '2px 0 0 0' }}>Print physical tags for fairs, markets, & shop displays</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#b45309',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '0.85rem',
            padding: '10px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Printer size={16} />
          <span>Print Price Tag</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', background: '#fffbeb', padding: '20px', borderRadius: '12px', border: '1px solid #fef3c7' }} ref={printRef}>
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            <Sparkles size={12} />
            <span>KarigarAI Authentic Craft</span>
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', margin: '0 0 6px 0' }}>{product.title}</h4>
          <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 12px 0' }}>
            {product.material ? `Material: ${product.material}` : ''} {product.craft_type ? `• Craft: ${product.craft_type}` : ''}
          </p>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#92400e' }}>{formattedPrice}</div>
        </div>

        <div className="qr-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', background: '#ffffff', border: '1px solid #fde68a', borderRadius: '12px' }}>
          <QRCodeSVG value={currentUrl} size={110} level="M" includeMargin={false} />
          <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '600', marginTop: '8px' }}>Scan for Product Page</span>
        </div>
      </div>
    </div>
  );
};
