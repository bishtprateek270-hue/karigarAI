import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { compressImageFile } from '../utils/imageCompressor';
import { Edit3, Save, ArrowLeft, Languages } from 'lucide-react';

export const EditProduct = ({ lang = 'en' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const [activeTabLang, setActiveTabLang] = useState(lang);

  // English State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');

  // Hindi State
  const [titleHi, setTitleHi] = useState('');
  const [descriptionHi, setDescriptionHi] = useState('');
  const [categoryHi, setCategoryHi] = useState('');
  const [tagsHi, setTagsHi] = useState('');

  // Shared State
  const [material, setMaterial] = useState('');
  const [craftType, setCraftType] = useState('');
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
        setTags(Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '');

        setTitleHi(data.title_hi || '');
        setDescriptionHi(data.description_hi || '');
        setCategoryHi(data.category_hi || '');
        setTagsHi(Array.isArray(data.tags_hi) ? data.tags_hi.join(', ') : data.tags_hi || '');

        setMaterial(data.material || '');
        setCraftType(data.craft_type || '');
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

  const handleTranslateContent = async (targetLang) => {
    setTranslating(true);
    setError('');
    try {
      const sourceCatalog = {
        title: title || titleHi,
        description: description || descriptionHi,
        category: category || categoryHi,
        tags: (tags || tagsHi).split(',').map(t => t.trim()).filter(Boolean),
      };
      const res = await api.translate(sourceCatalog, targetLang);
      if (targetLang === 'hi') {
        setTitleHi(res.title || '');
        setDescriptionHi(res.description || '');
        setCategoryHi(res.category || '');
        setTagsHi(Array.isArray(res.tags) ? res.tags.join(', ') : res.tags || '');
        setActiveTabLang('hi');
      } else {
        setTitle(res.title || '');
        setDescription(res.description || '');
        setCategory(res.category || '');
        setTags(Array.isArray(res.tags) ? res.tags.join(', ') : res.tags || '');
        setActiveTabLang('en');
      }
    } catch (err) {
      setError(err.message || 'Translation failed.');
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const tagsHiArray = tagsHi ? tagsHi.split(',').map(t => t.trim()).filter(Boolean) : [];

      const payload = {
        title: title || titleHi,
        description,
        category,
        material,
        craft_type: craftType,
        tags: tagsArray,
        title_hi: titleHi || null,
        description_hi: descriptionHi || null,
        category_hi: categoryHi || null,
        tags_hi: tagsHiArray.length > 0 ? tagsHiArray : null,
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
    <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Link to={`/products/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-muted)' }}>
        <ArrowLeft size={18} /> {lang === 'hi' ? 'रद्द करें और उत्पाद पर वापस जाएं' : 'Cancel & Back to Product'}
      </Link>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={24} color="var(--primary-color)" /> {lang === 'hi' ? 'उत्पाद लिस्टिंग संपादित करें' : 'Edit Product Listing'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {lang === 'hi' ? 'उत्पाद शीर्षक, विवरण, मूल्य या स्थिति अपडेट करें' : 'Update product details, title, category, tags, or price'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`btn-secondary ${activeTabLang === 'en' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTabLang('en')}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            >
              English
            </button>
            <button
              type="button"
              className={`btn-secondary ${activeTabLang === 'hi' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTabLang('hi')}
              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Translation Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', background: '#faf7f3', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Languages size={16} color="var(--primary-color)" /> AI Translation:
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleTranslateContent('hi')}
              className="btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              disabled={translating}
            >
              {translating ? 'अनुवाद हो रहा है...' : 'Translate to Hindi (हिंदी)'}
            </button>
            <button
              type="button"
              onClick={() => handleTranslateContent('en')}
              className="btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              disabled={translating}
            >
              {translating ? 'Translating...' : 'Translate to English'}
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          {activeTabLang === 'hi' ? (
            <>
              <div className="form-group">
                <label>उत्पाद शीर्षक (Title - Hindi) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={titleHi}
                  onChange={(e) => setTitleHi(e.target.value)}
                  required={activeTabLang === 'hi'}
                />
              </div>

              <div className="form-group">
                <label>विवरण (Description - Hindi)</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={descriptionHi}
                  onChange={(e) => setDescriptionHi(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>श्रेणी (Category - Hindi)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={categoryHi}
                    onChange={(e) => setCategoryHi(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>टैग (Tags - Hindi)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tagsHi}
                    onChange={(e) => setTagsHi(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Product Title (English) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required={activeTabLang === 'en'}
                />
              </div>

              <div className="form-group">
                <label>Description (English)</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Category (English)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Tags (English, comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>{lang === 'hi' ? 'सामग्री (Material)' : 'Material'}</label>
              <input
                type="text"
                className="form-input"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>{lang === 'hi' ? 'हस्तशिल्प प्रकार (Craft)' : 'Craft Type'}</label>
              <input
                type="text"
                className="form-input"
                value={craftType}
                onChange={(e) => setCraftType(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>{lang === 'hi' ? 'मूल्य (INR ₹)' : 'Price (INR ₹)'}</label>
              <input
                type="number"
                className="form-input"
                value={suggestedPrice}
                onChange={(e) => setSuggestedPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>{lang === 'hi' ? 'स्थिति (Status)' : 'Status'}</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="published">{lang === 'hi' ? 'प्रकाशित (Published)' : 'Published'}</option>
                <option value="draft">{lang === 'hi' ? 'ड्राफ्ट (Draft)' : 'Draft'}</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>{lang === 'hi' ? 'उत्पाद फोटो अपडेट करें (Update Product Photo)' : 'Update Product Photo'}</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#f0ebe4', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {imageUrl ? (
                  <img src={imageUrl} alt="Product Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Image</span>
                )}
              </div>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="form-input"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      const compressedUrl = await compressImageFile(file);
                      setImageUrl(compressedUrl);
                    } catch (err) {
                      setError('Failed to process image file.');
                    }
                  }
                }}
                style={{ padding: '8px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
              disabled={saving}
            >
              {saving ? <div className="spinner"></div> : <> <Save size={18} /> {lang === 'hi' ? 'उत्पाद अपडेट करें' : 'Update Product'} </>}
            </button>
            <Link to={`/products/${id}`} className="btn-secondary" style={{ padding: '12px 20px' }}>
              {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

