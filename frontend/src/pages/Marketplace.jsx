import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Sparkles, MessageCircle, Search, ShoppingBag, Eye, Tag, ArrowRight } from 'lucide-react';

export const Marketplace = ({ lang = 'en' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getPublicProducts();
        setProducts(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load public marketplace products.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const query = search.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(query)) ||
      (p.material && p.material.toLowerCase().includes(query)) ||
      (p.craft_type && p.craft_type.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)', color: '#ffffff', borderRadius: '20px', padding: '40px 24px', textAlign: 'center', marginBottom: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px' }}>
          <Sparkles size={16} color="#fde68a" />
          <span>{lang === 'hi' ? 'भारतीय हस्तशिल्प बाज़ार' : 'Direct Artisan Marketplace'}</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: '0 0 12px 0', fontFamily: 'serif' }}>
          {lang === 'hi' ? 'प्रामाणिक भारतीय हस्तशिल्प खोजें' : 'Discover Authentic Indian Craft Heritage'}
        </h1>
        <p style={{ fontSize: '1rem', color: '#fde68a', maxWidth: '640px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
          {lang === 'hi'
            ? 'बिचौलिए के बिना सीधे कारीगरों से खरीदें। सीधे व्हाट्सएप पर ऑर्डर करें।'
            : 'Buy directly from local artisans across India with zero middleman fees. Order directly on WhatsApp.'}
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: '540px', margin: '0 auto', position: 'relative' }}>
          <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'hi' ? 'सामग्री, श्रेणी या शिल्प खोजें...' : 'Search by pottery, terracotta, silver, wood, or title...'}
            style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', border: 'none', fontSize: '0.95rem', outline: 'none', background: '#ffffff', color: '#1f2937', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          />
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '14px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)', fontSize: '1.1rem' }}>
          {lang === 'hi' ? 'हस्तशिल्प उत्पाद लोड हो रहे हैं...' : 'Loading artisan craft products...'}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card" style={{ textCenter: 'center', padding: '48px 24px', textAlign: 'center' }}>
          <ShoppingBag size={48} color="var(--primary-color)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>
            {lang === 'hi' ? 'कोई उत्पाद नहीं मिला' : 'No Public Products Available Yet'}
          </h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '20px' }}>
            {lang === 'hi' ? 'कारीगर जल्द ही नए उत्पाद प्रकाशित करेंगे।' : 'Artisans publish craft products daily. Be the first to create and publish a listing!'}
          </p>
          <Link to="/add-product" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px' }}>
            <span>{lang === 'hi' ? 'अपना उत्पाद प्रकाशित करें' : 'Publish Your Craft Product'}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredProducts.map((product) => {
            const formattedPrice = product.suggested_price
              ? `₹${parseFloat(product.suggested_price).toLocaleString('en-IN')}`
              : 'Contact for Price';

            const cleanPhone = product.owner_phone ? product.owner_phone.replace(/\D/g, '') : '';
            const whatsappMsg = `Namaste! I am interested in purchasing your handcrafted item on KarigarAI: ${product.title} (${formattedPrice}).`;
            const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}` : null;

            return (
              <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                {/* Product Image */}
                <div style={{ height: '220px', width: '100%', background: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      <ShoppingBag size={40} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>
                    {product.craft_type || 'Handcrafted'}
                  </div>
                </div>

                {/* Details Container */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-color)', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                      {product.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description || 'Authentic handcrafted piece crafted with traditional methods.'}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.8rem', color: '#78350f' }}>
                      <Tag size={14} color="#b45309" />
                      <span>{product.material || 'Artisan Material'}</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#78350f', marginBottom: '12px' }}>
                      {formattedPrice}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#25D366', color: '#ffffff', fontWeight: '700', fontSize: '0.85rem', padding: '10px', borderRadius: '10px', textDecoration: 'none' }}
                        >
                          <MessageCircle size={16} />
                          <span>Order on WhatsApp</span>
                        </a>
                      ) : (
                        <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#f5f5f5', color: '#666', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600' }}>
                          Artisan Contact Pending
                        </div>
                      )}

                      <Link
                        to={`/products/${product.id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: '#fef3c7', color: '#78350f', borderRadius: '10px', textDecoration: 'none' }}
                        title="View Full Product Details"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
