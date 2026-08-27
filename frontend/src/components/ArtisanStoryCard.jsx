import React, { useState } from 'react';
import { api } from '../services/api';
import { BookOpen, Sparkles, Copy, Check } from 'lucide-react';

export const ArtisanStoryCard = ({ productName, material, craftType }) => {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateStory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.generateStory(productName, material, craftType);
      if (res.story) {
        setStory(res.story);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate artisan story.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!story) return;
    const textToCopy = activeLang === 'hi' ? story.story_hi : story.story_en;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ padding: '24px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #fef3c7', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#d97706', color: '#ffffff', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#78350f', margin: 0 }}>Artisan Heritage Story Card</h3>
            <p style={{ fontSize: '0.85rem', color: '#92400e', margin: '2px 0 0 0' }}>Cultural lineage, craft technique & artisan soul narrative</p>
          </div>
        </div>

        {story && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveLang('en')}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeLang === 'en' ? '#b45309' : '#fef3c7',
                color: activeLang === 'en' ? '#ffffff' : '#92400e',
              }}
            >
              English
            </button>
            <button
              onClick={() => setActiveLang('hi')}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeLang === 'hi' ? '#b45309' : '#fef3c7',
                color: activeLang === 'hi' ? '#ffffff' : '#92400e',
              }}
            >
              हिंदी
            </button>
            <button
              onClick={handleCopyText}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '8px',
                border: '1px solid #fcd34d',
                background: '#ffffff',
                color: '#78350f',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {error && <div style={{ fontSize: '0.85rem', color: '#b91c1c', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px' }}>{error}</div>}

      {!story ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: '0.9rem', color: '#92400e', marginBottom: '16px' }}>
            Generate an authentic cultural narrative highlighting the heritage and craftsmanship behind this piece.
          </p>
          <button
            onClick={handleGenerateStory}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.9rem',
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 2px 6px rgba(180,83,9,0.3)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Crafting Story...' : 'Generate Heritage Story Card'}</span>
          </button>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.9)', padding: '18px', borderRadius: '12px', border: '1px solid #fde68a', color: '#451a03', fontSize: '0.92rem', lineHeight: '1.7' }}>
          {(activeLang === 'hi' ? story.story_hi : story.story_en)
            .split('\n\n')
            .map((paragraph, index) => (
              <p key={index} style={{ marginBottom: index === 0 ? '12px' : 0 }}>
                {paragraph}
              </p>
            ))}
        </div>
      )}
    </div>
  );
};
