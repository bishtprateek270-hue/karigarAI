import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Edit3, Save, ArrowLeft } from 'lucide-react';

export const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [craftType, setCraftType] = useState('');
  const [tags, setTags] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [status, setStatus] = useState('published');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        setTitle(data.title || '');
        setDescription(data.description || '');
        setCategory(data.category || '');
        setMaterial(data.material || '');
        setCraftType(data.craft_type || '');
        setTags(Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '');
        setSuggestedPrice(data.suggested_price !== null ? data.suggested_price : '');
        setStatus(data.status || 'published');
        setImageUrl(data.image_url || '');
      } catch (err) {
        setError(err.message || 'Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        title,
        description,
        category,
        material,
        craft_type: craftType,
        tags: tagsArray,
        suggested_price: suggestedPrice ? parseFloat(suggestedPrice) : null,
        status,
        image_url: imageUrl || null,
      };

      await api.updateProduct(id, payload);
      navigate(`/products/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner" style={{ borderColor: 'var(--primary-color)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Link to={`/products/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-muted)' }}>
        <ArrowLeft size={18} /> Cancel & Back to Product
      </Link>

      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={24} color="var(--primary-color)" /> Edit Product Listing
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update product details, title, category, tags, or price</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Title *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Material</label>
              <input
                type="text"
                className="form-input"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Craft Type</label>
              <input
                type="text"
                className="form-input"
                value={craftType}
                onChange={(e) => setCraftType(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Price (INR ₹)</label>
            <input
              type="number"
              className="form-input"
              value={suggestedPrice}
              onChange={(e) => setSuggestedPrice(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
              disabled={saving}
            >
              {saving ? <div className="spinner"></div> : <> <Save size={18} /> Update Product </>}
            </button>
            <Link to={`/products/${id}`} className="btn-secondary" style={{ padding: '12px 20px' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
