import React, { useState } from 'react';
import { Package } from 'lucide-react';

export const ProductImage = ({ src, alt, iconSize = 48, style = {} }) => {
  const [hasError, setHasError] = useState(false);

  // If no URL or previous error, show fallback icon
  if (!src || hasError) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0ebe4' }}>
        <Package size={iconSize} color="#a0948c" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Product Image'}
      onError={() => setHasError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
    />
  );
};
