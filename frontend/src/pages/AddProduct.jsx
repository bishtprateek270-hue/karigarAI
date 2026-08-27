import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { UploadCloud, Sparkles, DollarSign, Save, Image as ImageIcon, Languages, CheckCircle } from 'lucide-react';

export const AddProduct = ({ lang = 'en' }) => {
  const navigate = useNavigate();

  // Step 1: File & Preview State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Step 2: Artisan-Provided Product & Production Cost Inputs
  const [productName, setProductName] = useState('');
  const [material, setMaterial] = useState('');
  const [craftType, setCraftType] = useState('');
  const [productSize, setProductSize] = useState('medium');
  const [basicDescription, setBasicDescription] = useState('');

  // Production Cost & Labor Inputs
  const [materialCost, setMaterialCost] = useState(300);
  const [makingHours, setMakingHours] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(100);
  const [profitMargin, setProfitMargin] = useState(25);

  // Generation & Status State
  const [generatingCatalog, setGeneratingCatalog] = useState(false);
  const [catalogGenerated, setCatalogGenerated] = useState(false);
  const [error, setError] = useState('');

  // Step 3: AI Generated & Editable Catalog State (English & Hindi)
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

  // Price Recommendation & Saving State
  const [priceTiers, setPriceTiers] = useState(null);
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [status, setStatus] = useState('published');
  const [saving, setSaving] = useState(false);

  // Handle File Drag and Drop Events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const resetStateForNewImage = () => {
    setCatalogGenerated(false);
    setTitle('');
    setDescription('');
    setCategory('');
    setTags('');
    setTitleHi('');
    setDescriptionHi('');
    setCategoryHi('');
    setTagsHi('');
    setPriceTiers(null);
    setSuggestedPrice('');
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png'].includes(ext)) {
        setError('Only .jpg, .jpeg, and .png image files are allowed.');
        return;
      }
      resetStateForNewImage();
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png'].includes(ext)) {
        setError('Only .jpg, .jpeg, and .png image files are allowed.');
        return;
      }
      resetStateForNewImage();
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Professional Catalog & Price Recommendation
  const handleGenerateCatalogAndPrice = async () => {
    if (!productName || !material || !craftType) {
      setError('Please fill in Product Name, Material, and Craft Type first.');
      return;
    }

    setError('');
    setGeneratingCatalog(true);

    try {
      // 1. Call Catalog Generation API with Artisan Facts
      const catalogPayload = {
        product_name: productName,
        material: material,
        craft_type: craftType,
        product_size: productSize,
        basic_description: basicDescription,
      };

      const catalogRes = await api.generateCatalog(catalogPayload);
      const cat = catalogRes.catalog || catalogRes;

      setTitle(cat.title || `Handcrafted ${productName}`);
      setDescription(cat.description || basicDescription);
      setCategory(cat.category || 'Home & Living > Handcrafted Products');
      setTags(Array.isArray(cat.tags) ? cat.tags.join(', ') : cat.tags || '');

      // 2. Call Price Calculation API
      const pricePayload = {
        material_cost: parseFloat(materialCost) || 0,
        making_time_hours: parseFloat(makingHours) || 0,
        hourly_rate: parseFloat(hourlyRate) || 0,
        product_size: productSize,
        craft_category: craftType,
        profit_margin: parseFloat(profitMargin) || 25,
      };

      const priceRes = await api.suggestPrice(pricePayload);
      setPriceTiers(priceRes);
      setSuggestedPrice(priceRes.recommended_price);

      setCatalogGenerated(true);
    } catch (err) {
      setError(err.message || 'Failed to generate catalog or calculate price recommendation.');
    } finally {
      setGeneratingCatalog(false);
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
        description: description || basicDescription,
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
            ? 'फोटो अपलोड करें ➔ विवरण और लागत दर्ज करें ➔ AI कैटलॉग और मूल्य प्राप्त करें ➔ समीक्षा और सहेजें'
            : 'Upload Image ➔ Enter Product Details & Production Costs ➔ Generate AI Catalog & Price ➔ Review & Save'}
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-2">
        {/* Left Column: Step 1 (Upload Image) & Step 2 (Artisan Inputs) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={20} color="var(--primary-color)" /> {lang === 'hi' ? 'चरण 1: उत्पाद फोटो अपलोड करें' : 'Step 1: Upload Craft Image'}
            </h3>

            <div
              style={{
                border: isDragging ? '2px dashed var(--primary-color)' : '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                backgroundColor: isDragging ? '#fdf3ef' : '#faf7f3',
                marginBottom: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => document.getElementById('craft-image-input-ph9').click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={previewUrl}
                    alt="Craft Preview"
                    style={{ maxHeight: '200px', width: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  />
                  <p style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {lang === 'hi' ? 'फोटो बदलने के लिए क्लिक करें' : 'Click to replace image'}
                  </p>
                </div>
              ) : (
                <div>
                  <UploadCloud size={40} color="var(--primary-color)" style={{ marginBottom: '8px' }} />
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'हस्तशिल्प फोटो चुनें या खींचें' : 'Choose or drag craft image'}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {lang === 'hi' ? 'समर्थित: JPG, JPEG, PNG (अधिकतम 10MB)' : 'Supports JPG, JPEG, PNG (max 10MB)'}
                  </p>
                </div>
              )}
              <input
                id="craft-image-input-ph9"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Step 2: Artisan Product & Production Inputs Form */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✍️ {lang === 'hi' ? 'चरण 2: उत्पाद विवरण और निर्माण लागत दर्ज करें' : 'Step 2: Enter Product Details & Production Costs'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                  {lang === 'hi' ? 'उत्पाद का नाम (Product Name) *' : 'Product Name *'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Handmade Terracotta Pottery Vase"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                    {lang === 'hi' ? 'सामग्री (Material) *' : 'Material *'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Terracotta Clay, Wood"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                    {lang === 'hi' ? 'हस्तशिल्प (Craft Type) *' : 'Craft Type *'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pottery, Wood Carving"
                    value={craftType}
                    onChange={(e) => setCraftType(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                    {lang === 'hi' ? 'उत्पाद का आकार (Size)' : 'Product Size'}
                  </label>
                  <select
                    className="form-select"
                    value={productSize}
                    onChange={(e) => setProductSize(e.target.value)}
                  >
                    <option value="small">{lang === 'hi' ? 'छोटा (Small)' : 'Small'}</option>
                    <option value="medium">{lang === 'hi' ? 'मध्यम (Medium)' : 'Medium'}</option>
                    <option value="large">{lang === 'hi' ? 'बड़ा (Large)' : 'Large'}</option>
                    <option value="extra_large">{lang === 'hi' ? 'अति विशाल (Extra Large)' : 'Extra Large'}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                    {lang === 'hi' ? 'लाभ मार्जिन (%)' : 'Target Profit Margin (%)'}
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(e.target.value)}
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                  {lang === 'hi' ? 'संक्षिप्त विवरण (Short Description)' : 'Short / Basic Description'}
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Hand-molded earthenware pot crafted using traditional wheel techniques and natural polish."
                  value={basicDescription}
                  onChange={(e) => setBasicDescription(e.target.value)}
                />
              </div>

              {/* Labor & Material Costs Box */}
              <div style={{ background: '#faf7f3', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.88rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={16} color="var(--primary-color)" /> {lang === 'hi' ? 'लागत विवरण' : 'Cost & Labor Inputs'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem' }}>Material Cost (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={materialCost}
                      onChange={(e) => setMaterialCost(e.target.value)}
                      style={{ padding: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem' }}>Making Time (Hrs)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={makingHours}
                      onChange={(e) => setMakingHours(e.target.value)}
                      style={{ padding: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem' }}>Hourly Rate (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      style={{ padding: '6px' }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateCatalogAndPrice}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '0.95rem' }}
                disabled={generatingCatalog || !productName || !material || !craftType}
              >
                {generatingCatalog ? (
                  <>
                    <div className="spinner"></div> {lang === 'hi' ? 'AI कैटलॉग तैयार हो रहा है...' : 'Generating Professional AI Catalog & Price...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> {lang === 'hi' ? 'AI पेशेवर कैटलॉग और मूल्य तैयार करें' : 'Generate Professional AI Catalog & Price'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Generated Listing Preview & Multilingual Editor */}
        <div className="card" style={{ opacity: catalogGenerated ? 1 : 0.65, pointerEvents: catalogGenerated ? 'auto' : 'none', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--primary-color)" /> {lang === 'hi' ? 'चरण 3: AI कैटलॉग और मूल्य संपादक' : 'Step 3: Professional Catalog & Price Editor'}
            </h3>

            {/* Language Switch Tabs */}
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

          {!catalogGenerated && (
            <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem' }}>
              ℹ️ {lang === 'hi' ? 'कृपया पहले बाईं ओर उत्पाद विवरण भरें और AI कैटलॉग बटन पर क्लिक करें।' : 'Please enter product details on the left and click Generate AI Catalog & Price.'}
            </div>
          )}

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
                disabled={translating || !catalogGenerated}
              >
                {translating ? 'अनुवाद हो रहा है...' : 'Translate to Hindi (हिंदी)'}
              </button>
              <button
                type="button"
                onClick={() => handleTranslateContent('en')}
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                disabled={translating || !catalogGenerated}
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
                  <label>Professional Title (English) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="AI will generate title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required={activeTabLang === 'en'}
                  />
                </div>

                <div className="form-group">
                  <label>Marketplace Description (English)</label>
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
                    <label>Category Path</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Home & Living > Pottery"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tags (Comma-separated)</label>
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

            {/* Calculated Price Tiers Box */}
            {priceTiers && (
              <div style={{ marginTop: '14px', background: '#faf7f3', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  📊 Price Recommendation Tiers (INR ₹):
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', textAlign: 'center', fontSize: '0.82rem' }}>
                  <div style={{ background: '#fff', padding: '6px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Cost</span>
                    <strong>₹{priceTiers.production_cost}</strong>
                  </div>
                  <div style={{ background: '#fff', padding: '6px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Minimum</span>
                    <strong>₹{priceTiers.minimum_price}</strong>
                  </div>
                  <div style={{ background: '#dcfce7', padding: '6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#15803d', display: 'block', fontWeight: '700' }}>Recommended</span>
                    <strong style={{ color: '#15803d' }}>₹{priceTiers.recommended_price}</strong>
                  </div>
                  <div style={{ background: '#fff', padding: '6px', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Maximum</span>
                    <strong>₹{priceTiers.maximum_price}</strong>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>{lang === 'hi' ? 'अंतिम बिक्री मूल्य (INR ₹)' : 'Final Selling Price (INR ₹)'}</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 1050"
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(e.target.value)}
                />
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
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              disabled={saving || !catalogGenerated}
            >
              {saving ? (
                <>
                  <div className="spinner"></div> {lang === 'hi' ? 'सहेजा जा रहा है...' : 'Saving Product to Catalog...'}
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
