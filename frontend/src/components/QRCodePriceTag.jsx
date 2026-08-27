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
    <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-serif">Exhibition QR Code Price Tag</h3>
            <p className="text-xs text-gray-500">Print physical tags for fairs, markets, & shop displays</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white font-medium px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Price Tag</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-amber-50/40 p-5 rounded-xl border border-amber-100" ref={printRef}>
        <div className="text-center sm:text-left flex-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>KarigarAI Authentic Craft</span>
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1">{product.title}</h4>
          <p className="text-xs text-gray-600 mb-3">
            {product.material ? `Material: ${product.material}` : ''} {product.craft_type ? `• Craft: ${product.craft_type}` : ''}
          </p>
          <div className="text-2xl font-black text-amber-800">{formattedPrice}</div>
        </div>

        <div className="qr-wrapper flex flex-col items-center p-3 bg-white border border-amber-200 rounded-xl shadow-sm">
          <QRCodeSVG value={currentUrl} size={110} level="M" includeMargin={false} />
          <span className="text-[10px] text-amber-800 font-medium mt-2">Scan for Product Page</span>
        </div>
      </div>
    </div>
  );
};
