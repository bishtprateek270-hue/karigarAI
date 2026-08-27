import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { UploadCloud, Sparkles, DollarSign, Save, Image as ImageIcon, CheckCircle, Languages, AlertTriangle, CheckSquare } from 'lucide-react';


export const AddProduct = ({ lang = 'en' }) => {
  const navigate = useNavigate();

  // Step 1: File & Preview State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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
      setError('');
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      setAiAnalysis(null);
      setAttributesConfirmed(false);
    }
  };

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

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      setAiAnalysis(null);
      setAttributesConfirmed(false);
    }
  };


  // Run Vision AI Analysis (/analyze-product)
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an artisan craft image first.');
      return;
    }
    setError('');
    setAnalyzing(true);
    setAttributesConfirmed(false);

    try {
      const res = await api.analyzeProduct(selectedFile);
      setAiAnalysis(res.analysis);
      if (res.image_url) {
        setPreviewUrl(res.image_url);
      }

      // Extract vision attributes into editable state
      const attrs = res.analysis.attributes || {};
      const pt = attrs.product_type?.value || res.analysis.product_type || '';
      const mat = attrs.material?.value || res.analysis.material || '';
      const col = attrs.primary_color?.value || res.analysis.primary_color || '';
      const craft = attrs.craft_type?.value || res.analysis.craft_type || '';
      const st = attrs.style?.value || res.analysis.style || '';

      setAttrProductType(pt === 'Unknown' ? '' : pt);
      setAttrMaterial(mat === 'Unknown' ? '' : mat);
      setAttrPrimaryColor(col === 'Unknown' ? '' : col);
      setAttrCraftType(craft === 'Unknown' ? '' : craft);
      setAttrStyle(st === 'Unknown' ? '' : st);

      // If initial AI response already had catalog, store it as draft catalog
      if (res.catalog) {
        setTitle(res.catalog.title || '');
        setDescription(res.catalog.description || '');
        setCategory(res.catalog.category || '');
        setTags(Array.isArray(res.catalog.tags) ? res.catalog.tags.join(', ') : res.catalog.tags || '');
      }
    } catch (err) {
      setError(err.message || 'Vision AI analysis failed. Please check backend server.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Confirm Attributes & Generate Final Catalog (/generate-catalog)
  const handleConfirmAttributes = async () => {
    if (!attrProductType || !attrMaterial || !attrCraftType) {
      setError('Please provide at least Product Type, Material, and Craft Type before generating catalog.');
      return;
    }

    setError('');
    setGeneratingCatalog(true);

    try {
      const confirmedPayload = {
        product_type: attrProductType,
        material: attrMaterial,
        primary_color: attrPrimaryColor || 'Natural',
        craft_type: attrCraftType,
        style: attrStyle || 'Traditional Handcrafted',
      };

      const res = await api.generateCatalog(confirmedPayload);
      const cat = res.catalog || res;

      setTitle(cat.title || '');
      setDescription(cat.description || '');
      setCategory(cat.category || '');
      setTags(Array.isArray(cat.tags) ? cat.tags.join(', ') : cat.tags || '');

      setMaterial(attrMaterial);
      setCraftType(attrCraftType);
      setAttributesConfirmed(true);
    } catch (err) {
      setError(err.message || 'Failed to generate catalog from confirmed attributes.');
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
        craft_category: craftType || attrCraftType || 'general',
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
        material: material || attrMaterial,
        craft_type: craftType || attrCraftType,
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

  const getConfidenceBadge = (meta) => {
    const conf = meta?.confidence?.toLowerCase() || 'medium';
    const val = meta?.value;

    if (conf === 'high' && val !== 'Unknown') {
      return <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>🟢 High Confidence</span>;
    }
    if (conf === 'medium' && val !== 'Unknown') {
      return <span style={{ background: '#fef9c3', color: '#a16207', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>🟡 Medium Confidence</span>;
    }
    return (
      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        ⚠️ Please verify
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>
          {lang === 'hi' ? 'उत्पाद जोड़ें और AI विवरण बनाएं' : 'Add Artisan Product & Generate AI Listing'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {lang === 'hi' ? 'अपनी फोटो अपलोड करें ➔ AI गुणों की समीक्षा करें ➔ कैटलॉग बनाएं ➔ मूल्य सहेजें।' : 'Upload Image ➔ Review/Correct AI Attributes ➔ Confirm ➔ Generate Catalog ➔ Price ➔ Save'}
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-2">
        {/* Left Column: Image Upload & Review AI Attributes */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={20} color="var(--primary-color)" /> {lang === 'hi' ? 'चरण 1: फोटो अपलोड करें' : 'Step 1: Upload Craft Image'}
            </h3>

            <div
              style={{
                border: isDragging ? '2px dashed var(--primary-color)' : '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: isDragging ? '#fdf3ef' : '#faf7f3',
                marginBottom: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => document.getElementById('craft-image-input-ph8').click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={previewUrl}
                    alt="Craft Preview"
                    style={{ maxHeight: '220px', width: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  />
                  <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {lang === 'hi' ? 'फोटो बदलने के लिए क्लिक करें' : 'Click to replace image'}
                  </p>
                </div>
              ) : (
                <div>
                  <UploadCloud size={44} color="var(--primary-color)" style={{ marginBottom: '10px' }} />
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>
                    {lang === 'hi' ? 'हस्तशिल्प फोटो चुनें या खींचें' : 'Choose or drag craft image'}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
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
              type="button"
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
                  <Sparkles size={18} /> {lang === 'hi' ? 'AI विजन विश्लेषण चलाएं' : 'Analyze Craft Image'}
                </>
              )}
            </button>
          </div>

          {/* Step 2: Review & Correct AI Analysis Panel */}
          {aiAnalysis && (
            <div style={{ padding: '16px', backgroundColor: '#faf7f3', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={18} color="var(--primary-color)" /> {lang === 'hi' ? 'चरण 2: AI गुणों की समीक्षा और सुधार करें' : 'Step 2: Review & Correct AI Attributes'}
                </h4>
                {attributesConfirmed && (
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                    ✓ Confirmed
                  </span>
                )}
              </div>

              {aiAnalysis.is_uncertain && (
                <div style={{ padding: '10px 14px', background: '#fff7ed', borderLeft: '4px solid #ea580c', borderRadius: '4px', marginBottom: '14px', fontSize: '0.85rem', color: '#9a3412', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>{lang === 'hi' ? 'सत्यापन आवश्यक है:' : 'Verification Recommended:'}</strong> {lang === 'hi'
                      ? 'हम इस उत्पाद की पहचान पूरे विश्वास के साथ नहीं कर सके। कृपया नीचे दिए गए गुणों की जांच करें या सही मान दर्ज करें।'
                      : 'We couldn\'t confidently identify all attributes. Please review and enter the Product Type, Material, and Craft Type below.'}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>{lang === 'hi' ? 'उत्पाद प्रकार (Product Type) *' : 'Product Type *'}</label>
                    {getConfidenceBadge(aiAnalysis.product_type_meta || aiAnalysis.attributes?.product_type)}
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={attrProductType}
                    onChange={(e) => setAttrProductType(e.target.value)}
                    placeholder="e.g. Carved Wooden Box, Terracotta Pot"
                    style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>{lang === 'hi' ? 'सामग्री (Material) *' : 'Material *'}</label>
                      {getConfidenceBadge(aiAnalysis.material_meta || aiAnalysis.attributes?.material)}
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={attrMaterial}
                      onChange={(e) => setAttrMaterial(e.target.value)}
                      placeholder="e.g. Clay, Wood, Brass"
                      style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>{lang === 'hi' ? 'हस्तशिल्प (Craft) *' : 'Craft Type *'}</label>
                      {getConfidenceBadge(aiAnalysis.craft_type_meta || aiAnalysis.attributes?.craft_type)}
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={attrCraftType}
                      onChange={(e) => setAttrCraftType(e.target.value)}
                      placeholder="e.g. Wood Carving, Pottery"
                      style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>{lang === 'hi' ? 'रंग (Color)' : 'Primary Color'}</label>
                      {getConfidenceBadge(aiAnalysis.primary_color_meta || aiAnalysis.attributes?.primary_color)}
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={attrPrimaryColor}
                      onChange={(e) => setAttrPrimaryColor(e.target.value)}
                      placeholder="e.g. Brown, Terracotta Red"
                      style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>{lang === 'hi' ? 'शैली (Style)' : 'Style'}</label>
                      {getConfidenceBadge(aiAnalysis.style_meta || aiAnalysis.attributes?.style)}
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={attrStyle}
                      onChange={(e) => setAttrStyle(e.target.value)}
                      placeholder="e.g. Traditional Handcrafted"
                      style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAttributes}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '8px', padding: '10px', fontSize: '0.92rem' }}
                  disabled={generatingCatalog}
                >
                  {generatingCatalog ? (
                    <>
                      <div className="spinner"></div> {lang === 'hi' ? 'कैटलॉग तैयार हो रहा है...' : 'Generating Catalog...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} /> {lang === 'hi' ? 'गुणों की पुष्टि करें और कैटलॉग बनाएं' : 'Confirm Attributes & Generate Catalog'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Generated Listing Preview & Multilingual Editor */}
        <div className="card" style={{ opacity: attributesConfirmed ? 1 : 0.6, pointerEvents: attributesConfirmed ? 'auto' : 'none', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--primary-color)" /> {lang === 'hi' ? 'चरण 3: कैटलॉग संपादक' : 'Step 3: Multilingual Catalog Editor'}
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

          {!attributesConfirmed && (
            <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem' }}>
              ℹ️ {lang === 'hi' ? 'कृपया पहले बाईं ओर गुणों की पुष्टि करें।' : 'Please review and confirm AI attributes on the left to unlock catalog generation.'}
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
                disabled={translating || !attributesConfirmed}
              >
                {translating ? 'अनुवाद हो रहा है...' : 'Translate to Hindi (हिंदी)'}
              </button>
              <button
                type="button"
                onClick={() => handleTranslateContent('en')}
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                disabled={translating || !attributesConfirmed}
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
              disabled={saving || !attributesConfirmed}
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

