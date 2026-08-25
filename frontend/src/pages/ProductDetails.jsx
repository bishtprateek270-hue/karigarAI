import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Package, ArrowLeft, Edit3, Trash2, Tag, Calendar, Layers, Sparkles } from 'lucide-react';

export const ProductDetails = () => {
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
    if (window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
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
        <Link to="/my-products" className="btn-primary">
          <ArrowLeft size={16} /> Back to My Products
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/my-products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-muted)' }}>
        <ArrowLeft size={18} /> Back to My Products
      </Link>

      <div className="card">
        <div className="grid-2" style={{ gap: '32px' }}>
          {/* Image Column */}
          <div style={{ height: '340px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0ebe4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Package size={72} color="#a0948c" />
            )}
          </div>

          {/* Details Column */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className={`badge ${product.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                  {product.status}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> {new Date(product.created_at).toLocaleDateString()}
                </span>
              </div>

              <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{product.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>{product.category || 'General Craft'}</p>

              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '20px' }}>
                ₹{product.suggested_price ? product.suggested_price.toLocaleString() : 'N/A'}
              </div>

              <div style={{ background: '#faf7f3', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><strong>Material:</strong> {product.material || 'N/A'}</div>
                <div><strong>Craft Type:</strong> {product.craft_type || 'N/A'}</div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '6px' }}>Description</h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                  {product.description || 'No description provided.'}
                </p>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} color="var(--primary-color)" /> Tags
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {product.tags.map((tag, idx) => (
                      <span key={idx} style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '600' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <Link to={`/edit-product/${product.id}`} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <Edit3 size={16} /> Edit Product
              </Link>
              <button onClick={handleDelete} className="btn-danger">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
