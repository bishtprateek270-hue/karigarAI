import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Package, ArrowLeft, Edit3, Trash2, Tag, Calendar } from 'lucide-react';
import { ProductImage } from '../components/ProductImage';
import { ArtisanStoryCard } from '../components/ArtisanStoryCard';
import { QRCodePriceTag } from '../components/QRCodePriceTag';
import { WhatsAppOrderButton } from '../components/WhatsAppOrderButton';

export const ProductDetails = ({ lang = 'en' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product catalog entry?')) {
      try {
        await api.deleteProduct(id);
        navigate('/my-products');
      } catch (err) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner" style={{ borderColor: 'var(--primary-color)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="error-banner">{error || 'Product not found.'}</div>
        <Link to="/my-products" className="btn-secondary" style={{ marginTop: '16px', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to My Products
        </Link>
      </div>
    );
  }

  const displayTitle = lang === 'hi' && product.title_hi ? product.title_hi : product.title;
  const displayDescription = lang === 'hi' && product.description_hi ? product.description_hi : product.description;
  const displayCategory = lang === 'hi' && product.category_hi ? product.category_hi : product.category;
  const displayTags = lang === 'hi' && product.tags_hi && product.tags_hi.length > 0 ? product.tags_hi : product.tags;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/my-products" className="btn-secondary">
          <ArrowLeft size={16} /> {lang === 'hi' ? 'वापस जाएं' : 'Back to My Products'}
        </Link>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/edit-product/${product.id}`} className="btn-primary">
            <Edit3 size={16} /> {lang === 'hi' ? 'संपादित करें' : 'Edit Listing'}
          </Link>
          <button type="button" onClick={handleDelete} className="btn-danger">
            <Trash2 size={16} /> {lang === 'hi' ? 'हटाएं' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: Image Box */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ width: '100%', height: '360px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0ebe4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ProductImage src={product.image_url} alt={displayTitle} iconSize={80} />
          </div>
        </div>

        {/* Right Column: Product Metadata */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className={`badge ${product.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                {product.status}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> Created: {new Date(product.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{displayTitle}</h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--primary-color)', fontWeight: '600' }}>
              {displayCategory || 'General Craft'}
            </p>
          </div>

          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-color)', background: '#faf7f3', padding: '12px 18px', borderRadius: '8px', width: 'fit-content' }}>
            ₹{product.suggested_price ? product.suggested_price.toLocaleString() : 'Not Set'}
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '6px' }}>Description</h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-color)', lineHeight: '1.6' }}>
              {displayDescription || 'No description provided.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#faf7f3', padding: '12px', borderRadius: '8px', fontSize: '0.88rem' }}>
            <div><strong>Material:</strong> {product.material || 'N/A'}</div>
            <div><strong>Craft Technique:</strong> {product.craft_type || 'N/A'}</div>
          </div>

          {displayTags && displayTags.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={14} /> Tags
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {displayTags.map((tag, idx) => (
                  <span key={idx} style={{ background: '#f0ebe4', color: 'var(--text-color)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Direct Order Component */}
      <WhatsAppOrderButton product={product} />

      {/* Artisan Heritage Story Component */}
      <ArtisanStoryCard
        productName={product.title}
        material={product.material}
        craftType={product.craft_type}
      />

      {/* Exhibition Printable QR Code Price Tag Component */}
      <QRCodePriceTag product={product} />
    </div>
  );
};
