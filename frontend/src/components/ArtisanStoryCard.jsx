import React, { useState } from 'react';
import { api } from '../services/api';
import { BookOpen, Sparkles, Copy, Check, Languages } from 'lucide-react';

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
    <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 shadow-sm mb-8 transition-all hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-amber-200/60">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-950 font-serif">Artisan Heritage Story Card</h3>
            <p className="text-xs text-amber-700">Cultural lineage, craft technique & artisan soul narrative</p>
          </div>
        </div>

        {story && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveLang('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeLang === 'en'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLang('hi')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeLang === 'hi'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={handleCopyText}
              className="p-1.5 bg-white border border-amber-300 text-amber-800 rounded-lg hover:bg-amber-100 transition-all flex items-center space-x-1 text-xs px-2.5"
              title="Copy Story Text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {error && <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg mb-3">{error}</div>}

      {!story ? (
        <div className="text-center py-4">
          <p className="text-sm text-amber-800 mb-4 max-w-lg mx-auto">
            Generate an authentic cultural narrative highlighting the heritage and craftsmanship behind this piece.
          </p>
          <button
            onClick={handleGenerateStory}
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm text-sm transition-all disabled:opacity-50 hover:shadow-md"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>{loading ? 'Crafting Story...' : 'Generate Heritage Story Card'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 text-amber-950 font-serif leading-relaxed text-sm bg-white/80 p-4 rounded-xl border border-amber-200/60 shadow-inner">
          {(activeLang === 'hi' ? story.story_hi : story.story_en)
            .split('\n\n')
            .map((paragraph, index) => (
              <p key={index} className="first-letter:text-lg first-letter:font-bold first-letter:text-amber-800">
                {paragraph}
              </p>
            ))}
        </div>
      )}
    </div>
  );
};
