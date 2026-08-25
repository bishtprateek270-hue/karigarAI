import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { UploadCloud, Sparkles, DollarSign, Save, Image as ImageIcon, CheckCircle, Languages, Globe } from 'lucide-react';

export const AddProduct = ({ lang = 'en' }) => {
  const navigate = useNavigate();

  // Step 1: File & Preview State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Step 2: AI Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [error, setError] = useState('');

  // Step 3: Editable Catalog Form State (English & Hindi)
  const [activeTabLang, setActiveTabLang] = useState(lang);
  const [translating, setTranslating] = useState(false);

  // English Catalog State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');

  // Hindi Catalog State
  const [titleHi, setTitleHi] = useState('');
  const [descriptionHi, setDescriptionHi] = useState('');
  const [categoryHi, setCategoryHi] = useState('');
  const [tagsHi, setTagsHi] = useState('');

  // Shared Common Product Properties
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

  // Trigger Translation (/translate)
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
    const activeTitle = activeTabLang === 'hi' ? (titleHi || title) : (title || titleHi);

    if (!activeTitle) {
      setError('Product title is required.');
      return;
    }
    setError('');
    setSaving(true);

    try {
      const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const tagsHiArray = tagsHi ? tagsHi.split(',').map(t => t.trim()).filter(Boolean) : [];

      const productPayload = {
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
        <h1 style={{ fontSize: '1.8rem' }}>
          {lang === 'hi' ? 'उत्पाद जोड़ें और AI विवरण बनाएं' : 'Add Artisan Product & Generate AI Listing'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {lang === 'hi'
            ? 'अपनी हस्तशिल्प फोटो अपलोड करें, AI विश्लेषण चलाएं, और हिंदी/अंग्रेजी में कैटलॉग बनाएं।'
            : 'Upload a craft photo to extract Vision AI features, generate a listing in English or Hindi, and save to catalog.'}
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-2">
        {/* Left Column: Image Upload & Preview */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={20} color="var(--primary-color)" /> {lang === 'hi' ? 'चरण 1: फोटो अपलोड करें' : 'Step 1: Upload Craft Image'}
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
            onClick={() => document.getElementById('craft-image-input-ph8').click()}
          >
            {previewUrl ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={previewUrl}
                  alt="Craft Preview"
                  style={{ maxHeight: '260px', width: '100%', objectFit: 'contain', borderRadius: '8px' }}
                />
                <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {lang === 'hi' ? 'फोटो बदलने के लिए क्लिक करें' : 'Click to replace image'}
                </p>
              </div>
            ) : (
              <div>
                <UploadCloud size={48} color="var(--primary-color)" style={{ marginBottom: '12px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                  {lang === 'hi' ? 'हस्तशिल्प फोटो चुनें या खींचें' : 'Choose or drag craft image'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {lang === 'hi' ? 'समर्थित प्रारूप: JPG, JPEG, PNG (अधिकतम 10MB)' : 'Supports JPG, JPEG, PNG (max 10MB)'}
                </p>
              </div>
            )}
            <input
              id="craft-image-input-ph8"
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
                <div className="spinner"></div> {lang === 'hi' ? 'AI विश्लेषण चल रहा है...' : 'Running Vision AI Analysis...'}
              </>
            ) : (
              <>
                <Sparkles size={18} /> {lang === 'hi' ? 'AI विजन विश्लेषण चलाएं' : 'Run AI Vision & Catalog Generator'}
              </>
            )}
          </button>

          {/* AI Feature Inspection Badge Card */}
          {aiAnalysis && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', border: '1px solid #f3d7cb' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-color)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> {lang === 'hi' ? 'पहचाने गए विजन गुण' : 'Detected Vision Attributes'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                <div><strong>{lang === 'hi' ? 'उत्पाद:' : 'Product:'}</strong> {aiAnalysis.product_type}</div>
                <div><strong>{lang === 'hi' ? 'सामग्री:' : 'Material:'}</strong> {aiAnalysis.material}</div>
                <div><strong>{lang === 'hi' ? 'रंग:' : 'Color:'}</strong> {aiAnalysis.primary_color}</div>
                <div><strong>{lang === 'hi' ? 'हस्तशिल्प:' : 'Craft:'}</strong> {aiAnalysis.craft_type}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>{lang === 'hi' ? 'शैली:' : 'Style:'}</strong> {aiAnalysis.style}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Generated Listing Preview & Multilingual Editor */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--primary-color)" /> {lang === 'hi' ? 'चरण 2: कैटलॉग संपादक' : 'Step 2: Multilingual Catalog Editor'}
            </h3>

            {/* Language Switch Tabs & Instant Translator */}
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

          {/* Quick Translate Action Bar */}
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

          <form onSubmit={handleSaveProduct}>
            {activeTabLang === 'hi' ? (
              /* Hindi Input Fields */
              <>
                <div className="form-group">
                  <label>उत्पाद शीर्षक (Title - Hindi) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="उदा. हस्तनिर्मित मिट्टी का बर्तन"
                    value={titleHi}
                    onChange={(e) => setTitleHi(e.target.value)}
                    required={activeTabLang === 'hi'}
                  />
                </div>

                <div className="form-group">
                  <label>विवरण (Description - Hindi)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="हिंदी में उत्पाद विवरण दर्ज करें..."
                    value={descriptionHi}
                    onChange={(e) => setDescriptionHi(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>श्रेणी (Category - Hindi)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="उदा. गृह सजावट > मिट्टी के बर्तन"
                      value={categoryHi}
                      onChange={(e) => setCategoryHi(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>टैग (Tags - Hindi)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="टेराकोटा, मिट्टी, हस्तशिल्प"
                      value={tagsHi}
                      onChange={(e) => setTagsHi(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* English Input Fields */
              <>
                <div className="form-group">
                  <label>Product Title (English) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="AI will populate title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required={activeTabLang === 'en'}
                  />
                </div>

                <div className="form-group">
                  <label>Description (English)</label>
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
                    <label>Category (English)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Home Decor"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tags (English, comma-separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="pottery, clay, handcrafted"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Shared Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>{lang === 'hi' ? 'सामग्री (Material)' : 'Material'}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Clay, Wood"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{lang === 'hi' ? 'हस्तशिल्प प्रकार (Craft)' : 'Craft Type'}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Pottery"
                  value={craftType}
                  onChange={(e) => setCraftType(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{lang === 'hi' ? 'उत्पाद की स्थिति (Status)' : 'Status'}</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="published">{lang === 'hi' ? 'प्रकाशित (Published)' : 'Published'}</option>
                <option value="draft">{lang === 'hi' ? 'ड्राफ्ट (Draft)' : 'Draft'}</option>
              </select>
            </div>

            {/* Price Recommendation Section */}
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#faf7f3', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={16} color="var(--primary-color)" /> {lang === 'hi' ? 'मूल्य कैलकुलेटर' : 'Price Recommendation Calculator'}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem' }}>{lang === 'hi' ? 'सामग्री लागत (₹)' : 'Material Cost (₹)'}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(e.target.value)}
                    style={{ padding: '6px 10px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem' }}>{lang === 'hi' ? 'बनाने का समय (घंटे)' : 'Making Time (Hours)'}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={makingHours}
                    onChange={(e) => setMakingHours(e.target.value)}
                    style={{ padding: '6px 10px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem' }}>{lang === 'hi' ? 'प्रति घंटा दर (₹)' : 'Hourly Rate (₹)'}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    style={{ padding: '6px 10px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem' }}>{lang === 'hi' ? 'उत्पाद का आकार' : 'Product Size'}</label>
                  <select
                    className="form-select"
                    value={productSize}
                    onChange={(e) => setProductSize(e.target.value)}
                    style={{ padding: '6px 10px' }}
                  >
                    <option value="small">{lang === 'hi' ? 'छोटा (Small)' : 'Small'}</option>
                    <option value="medium">{lang === 'hi' ? 'मध्यम (Medium)' : 'Medium'}</option>
                    <option value="large">{lang === 'hi' ? 'बड़ा (Large)' : 'Large'}</option>
                    <option value="extra_large">{lang === 'hi' ? 'अति विशाल (Extra Large)' : 'Extra Large'}</option>
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
                {calculatingPrice ? (lang === 'hi' ? 'गणना हो रही है...' : 'Calculating...') : (lang === 'hi' ? 'अनुशंसित मूल्य की गणना करें' : 'Calculate Price Recommendation')}
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
              <label>{lang === 'hi' ? 'अंतिम मूल्य (INR ₹)' : 'Final Price (INR ₹)'}</label>
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
                  <div className="spinner"></div> {lang === 'hi' ? 'सहेजा जा रहा है...' : 'Saving to Catalog...'}
                </>
              ) : (
                <>
                  <Save size={18} /> {lang === 'hi' ? 'उत्पाद कैटलॉग में सहेजें' : 'Save Product to Catalog'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
