import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PlusCircle, Package, Sparkles, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export const Dashboard = ({ lang = 'en' }) => {

  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProducts();
  }, []);

  const publishedCount = products.filter(p => p.status === 'published').length;
  const draftCount = products.filter(p => p.status === 'draft').length;

  const getDisplayTitle = (p) => {
    if (lang === 'hi' && p.title_hi) return p.title_hi;
    return p.title;
  };

  const getDisplayCategory = (p) => {
    if (lang === 'hi' && p.category_hi) return p.category_hi;
    return p.category || (lang === 'hi' ? 'सामान्य हस्तशिल्प' : 'General Craft');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Hero Header */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #c85a32 0%, #8c3f25 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'hi' ? 'कारीगर निर्माता पोर्टल' : 'Artisan Creator Portal'}
            </span>
            <h1 style={{ fontSize: '2.2rem', marginTop: '8px', color: '#fff' }}>
              {lang === 'hi' ? `नमस्ते, ${user?.name || ''}! 🙏` : `Namaste, ${user?.name || ''}! 🙏`}
            </h1>
            <p style={{ opacity: 0.9, marginTop: '4px', maxWidth: '600px' }}>
              {lang === 'hi'
                ? 'कारीगर-एआई डैशबोर्ड में आपका स्वागत है। अपनी हस्तशिल्प फोटो अपलोड करें, एआई विश्लेषण चलाएं, और मूल्य सिफारिशें प्राप्त करें।'
                : 'Welcome to your KarigarAI Dashboard. Upload your craft photos to automatically analyze features, generate marketplace listings, and calculate price recommendations.'}
            </p>
          </div>
          <Link to="/add-product" className="btn-primary" style={{ background: '#fff', color: 'var(--primary-color)', padding: '12px 24px', fontSize: '1rem' }}>
            <PlusCircle size={20} />
            <span>{lang === 'hi' ? 'नया उत्पाद जोड़ें' : 'Add New Product'}</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-3">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', background: '#fdf3ef', borderRadius: '12px', color: 'var(--primary-color)' }}>
            <Package size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {lang === 'hi' ? 'कुल उत्पाद' : 'Total Products'}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{products.length}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '12px', color: '#16a34a' }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {lang === 'hi' ? 'प्रकाशित उत्पाद' : 'Published Products'}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{publishedCount}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', background: '#fef3c7', borderRadius: '12px', color: '#d97706' }}>
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {lang === 'hi' ? 'ड्राफ्ट सूचियां' : 'Draft Listings'}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{draftCount}</div>
          </div>
        </div>
      </div>

      {/* Quick Action & Recent Products */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.3rem' }}>
            {lang === 'hi' ? 'हाल के हस्तशिल्प उत्पाद' : 'Recent Artisan Products'}
          </h3>
          <Link to="/my-products" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', fontSize: '0.9rem' }}>
            {lang === 'hi' ? 'सभी उत्पाद देखें' : 'View All Products'} <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ borderColor: 'var(--primary-color)', borderTopColor: 'transparent' }}></div>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-color)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            <Sparkles size={40} color="var(--primary-color)" style={{ marginBottom: '12px' }} />
            <h4>{lang === 'hi' ? 'अभी कोई उत्पाद नहीं बनाया गया है' : 'No products created yet'}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              {lang === 'hi'
                ? 'AI द्वारा तुरंत लिस्टिंग बनाने के लिए अपनी पहली हस्तशिल्प फोटो अपलोड करें!'
                : 'Upload your first artisan craft photo to let AI generate an instant listing!'}
            </p>
            <Link to="/add-product" className="btn-primary">
              <PlusCircle size={18} /> {lang === 'hi' ? 'पहला उत्पाद जोड़ें' : 'Add Your First Product'}
            </Link>
          </div>
        ) : (
          <div className="grid-3">
            {products.slice(0, 3).map((p) => (
              <div key={p.id} className="card" style={{ padding: '16px', background: '#fff', border: '1px solid var(--border-color)' }}>
                <div style={{ height: '160px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f0ebe4', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={getDisplayTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={48} color="#a0948c" />
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className={`badge ${p.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                    {p.status === 'published' ? (lang === 'hi' ? 'प्रकाशित' : 'published') : (lang === 'hi' ? 'ड्राफ्ट' : 'draft')}
                  </span>
                  <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                    ₹{p.suggested_price ? p.suggested_price.toLocaleString() : 'N/A'}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getDisplayTitle(p)}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{getDisplayCategory(p)}</p>
                <Link to={`/products/${p.id}`} className="btn-outline" style={{ width: '100%', padding: '6px', fontSize: '0.85rem', textAlign: 'center' }}>
                  {lang === 'hi' ? 'विवरण देखें' : 'View Details'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

