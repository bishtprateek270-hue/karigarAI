import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { UploadCloud, Sparkles, DollarSign, Save, Image as ImageIcon, CheckCircle, Tag } from 'lucide-react';

export const AddProduct = () => {
  const navigate = useNavigate();

  // Step 1: File & Preview State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Step 2: AI Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [error, setError] = useState('');

  // Step 3: Editable Catalog Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [material, setMaterial] = useState('');
  const [craftType, setCraftType] = useState('');
  const [status, setStatus] = useState('published');
  const [suggestedPrice, setSuggestedPrice] = useState('');

  // Step 4: Pricing Engine Calculation Form State
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [materialCost, setMaterialCost] = useState(300);
  const [makingHours, setMakingHours] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(100);
  const [productSize, setProductSize] = useState('medium');
  const [priceTiers, setPriceTiers] = useState(null);

  // Saving State
  const [saving, setSaving] = useState(false);

  // Handle File Change & Image Preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png'].includes(ext)) {
        setError('Only .jpg, .jpeg, and .png image files are allowed.');
        return;
      }
      setError('');
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAiAnalysis(null);
    }
  };

  // Run AI Analysis (/analyze-product)
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an artisan craft image first.');
      return;
    }
    setError('');
    setAnalyzing(true);

    try {
      const res = await api.analyzeProduct(selectedFile);
      setAiAnalysis(res.analysis);

      // Autofill Catalog Form from AI Output
      if (res.catalog) {
        setTitle(res.catalog.title || '');
        setDescription(res.catalog.description || '');
        setCategory(res.catalog.category || '');
        setTags(Array.isArray(res.catalog.tags) ? res.catalog.tags.join(', ') : res.catalog.tags || '');
      }
      if (res.analysis) {
        setMaterial(res.analysis.material || '');
        setCraftType(res.analysis.craft_type || '');
      }
    } catch (err) {
      setError(err.message || 'Vision AI analysis failed. Please check backend server.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Calculate Price Suggestion (/suggest-price)
  const handleCalculatePrice = async () => {
    setCalculatingPrice(true);
    setError('');

    try {
      const payload = {
        material_cost: parseFloat(materialCost) || 0,
        making_time_hours: parseFloat(makingHours) || 0,
        hourly_rate: parseFloat(hourlyRate) || 0,
        product_size: productSize,
        craft_category: craftType || 'general',
      };
      const res = await api.suggestPrice(payload);
      setPriceTiers(res);
      setSuggestedPrice(res.recommended_price);
    } catch (err) {
      setError(err.message || 'Price calculation failed.');
    } finally {
      setCalculatingPrice(false);
    }
  };

  // Save Final Product to Database (POST /products)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!title) {
      setError('Product title is required.');
      return;
    }
    setError('');
    setSaving(true);

    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const productPayload = {
        title,
        description,
        category,
        material,
        craft_type: craftType,
        tags: tagsArray,
        suggested_price: suggestedPrice ? parseFloat(suggestedPrice) : null,
        image_url: previewUrl || null,
        status,
      };

      await api.createProduct(productPayload);
      navigate('/my-products');
    } catch (err) {
      setError(err.message || 'Failed to save product to database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Add Artisan Product</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Upload a craft photo to extract Vision AI features, generate a listing, and save to catalog.
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-2">
        {/* Left Column: Image Upload & Preview */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={20} color="var(--primary-color)" /> Step 1: Upload Craft Image
          </h3>

          <div
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: '#faf7f3',
              marginBottom: '20px',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('craft-image-input').click()}
          >
            {previewUrl ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={previewUrl}
                  alt="Craft Preview"
                  style={{ maxHeight: '260px', width: '100%', objectFit: 'contain', borderRadius: '8px' }}
                />
                <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click to replace image</p>
              </div>
            ) : (
              <div>
                <UploadCloud size={48} color="var(--primary-color)" style={{ marginBottom: '12px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Choose or drag craft image</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supports JPG, JPEG, PNG (max 10MB)</p>
              </div>
            )}
            <input
              id="craft-image-input"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <button
            onClick={handleAnalyze}
            className="btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={!selectedFile || analyzing}
          >
            {analyzing ? (
              <>
                <div className="spinner"></div> Running Vision AI Analysis...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Run AI Vision & Catalog Generator
              </>
            )}
          </button>

          {/* AI Feature Inspection Badge Card */}
          {aiAnalysis && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', border: '1px solid #f3d7cb' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-color)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> Detected Vision Attributes
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                <div><strong>Product:</strong> {aiAnalysis.product_type}</div>
                <div><strong>Material:</strong> {aiAnalysis.material}</div>
                <div><strong>Color:</strong> {aiAnalysis.primary_color}</div>
                <div><strong>Craft:</strong> {aiAnalysis.craft_type}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Style:</strong> {aiAnalysis.style}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Generated Listing Preview & Editing */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--primary-color)" /> Step 2: AI Listing Preview & Editor
          </h3>

          <form onSubmit={handleSaveProduct}>
            <div className="form-group">
              <label>Product Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="AI will populate title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="AI will generate description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Home Decor"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Material</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Clay, Wood"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Craft Type</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Pottery"
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
              <label>Search Tags (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="pottery, clay, handcrafted"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {/* Price Recommendation Section */}
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#faf7f3', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={16} color="var(--primary-color)" /> Rule-Based Price Calculator
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem' }}>Material Cost (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(e.target.value)}
                    style={{ padding: '6px 10px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem' }}>Making Time (Hours)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={makingHours}
                    onChange={(e) => setMakingHours(e.target.value)}
                    style={{ padding: '6px 10px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem' }}>Hourly Rate (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    style={{ padding: '6px 10px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem' }}>Product Size</label>
                  <select
                    className="form-select"
                    value={productSize}
                    onChange={(e) => setProductSize(e.target.value)}
                    style={{ padding: '6px 10px' }}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra_large">Extra Large</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCalculatePrice}
                className="btn-secondary"
                style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '0.85rem' }}
                disabled={calculatingPrice}
              >
                {calculatingPrice ? 'Calculating...' : 'Calculate Price Recommendation'}
              </button>

              {priceTiers && (
                <div style={{ marginTop: '12px', background: '#fff', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Min: <strong>₹{priceTiers.minimum_price}</strong></span>
                  <span style={{ color: 'var(--primary-color)' }}>Rec: <strong>₹{priceTiers.recommended_price}</strong></span>
                  <span>Max: <strong>₹{priceTiers.maximum_price}</strong></span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Final Price (INR ₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 1050"
                value={suggestedPrice}
                onChange={(e) => setSuggestedPrice(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner"></div> Saving to Catalog...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Product to Catalog
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
