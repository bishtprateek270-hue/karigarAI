import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Package, PlusCircle, Trash2, Edit3, Eye, Search, Filter } from 'lucide-react';

export const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>My Artisan Products</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your saved product listings, drafts, and catalog entries</p>
        </div>
        <Link to="/add-product" className="btn-primary">
          <PlusCircle size={18} /> Add New Product
        </Link>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn-secondary ${filterStatus === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setFilterStatus('all')}
            style={{ padding: '6px 14px', fontSize: '0.88rem' }}
          >
            All ({products.length})
          </button>
          <button
            className={`btn-secondary ${filterStatus === 'published' ? 'btn-primary' : ''}`}
            onClick={() => setFilterStatus('published')}
            style={{ padding: '6px 14px', fontSize: '0.88rem' }}
          >
            Published ({products.filter(p => p.status === 'published').length})
          </button>
          <button
            className={`btn-secondary ${filterStatus === 'draft' ? 'btn-primary' : ''}`}
            onClick={() => setFilterStatus('draft')}
            style={{ padding: '6px 14px', fontSize: '0.88rem' }}
          >
            Drafts ({products.filter(p => p.status === 'draft').length})
          </button>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ borderColor: 'var(--primary-color)', borderTopColor: 'transparent' }}></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Package size={48} color="#a0948c" style={{ marginBottom: '12px' }} />
          <h3>No products match your filter</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Try changing search terms or add a new product.</p>
          <Link to="/add-product" className="btn-primary">
            <PlusCircle size={18} /> Add Product Now
          </Link>
        </div>
      ) : (
        <div className="grid-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ height: '180px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f0ebe4', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={56} color="#a0948c" />
                  )}
                  <span className={`badge ${product.status === 'published' ? 'badge-published' : 'badge-draft'}`} style={{ position: 'absolute', top: '10px', right: '10px', boxShadow: 'var(--shadow-sm)' }}>
                    {product.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {product.category || 'General Craft'}
                </p>

                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '16px' }}>
                  ₹{product.suggested_price ? product.suggested_price.toLocaleString() : 'N/A'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <Link to={`/products/${product.id}`} className="btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.82rem', justifyContent: 'center' }}>
                  <Eye size={14} /> View
                </Link>
                <Link to={`/edit-product/${product.id}`} className="btn-outline" style={{ flex: 1, padding: '6px', fontSize: '0.82rem', justifyContent: 'center' }}>
                  <Edit3 size={14} /> Edit
                </Link>
                <button onClick={() => handleDelete(product.id, product.title)} className="btn-danger" style={{ padding: '6px 10px', fontSize: '0.82rem' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
