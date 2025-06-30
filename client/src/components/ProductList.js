import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFileExcel, FaTag, FaBarcode, FaBox } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import ExcelImport from './ExcelImport';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.hsnCode && product.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage Harsh Enterprise product catalog</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(!showImport)}
            className="btn btn-outline"
          >
            <FaFileExcel />
            {showImport ? 'Hide Import' : 'Import Excel'}
          </button>
          <Link to="/products/new" className="btn btn-primary">
            <FaPlus />
            Add Product
          </Link>
        </div>
      </div>

      {/* Excel Import Section */}
      {showImport && (
        <div className="mb-6">
          <ExcelImport onImportComplete={fetchProducts} />
        </div>
      )}

      {/* Search */}
      <div className="card">
        <div className="form-group">
          <label className="form-label">Search Products</label>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, or HSN code..."
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Products</h3>
          <Link to="/products/new" className="btn btn-primary">
            <FaPlus />
            Add Product
          </Link>
        </div>

        <div className="product-list-vertical">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product._id} className="product-card-vertical" style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'}}>
                <div style={{fontWeight: 600, color: '#2563eb', fontSize: 18}}>{product.name}</div>
                <div style={{fontSize: 14, color: '#6b7280', margin: '4px 0 8px 0'}}>{product.description}</div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8}}>
                  <div style={{fontWeight: 500, fontSize: 15}}>Price: <span style={{color: '#059669'}}>{formatCurrency(product.rate)}</span></div>
                  <div style={{fontSize: 14}}>HSN Code: <span style={{fontWeight: 500}}>{product.hsnCode}</span></div>
                  <div style={{fontSize: 14}}>Unit: <span style={{fontWeight: 500}}>{product.unit}</span></div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/products/${product._id}/edit`}
                    className="btn btn-outline btn-sm"
                    title="Edit Product"
                  >
                    <FaEdit />
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="btn btn-danger btn-sm"
                    title="Delete Product"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FaSearch />
              </div>
              <div className="empty-state-title">No products found</div>
              <div className="empty-state-description">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Add your first product to get started'
                }
              </div>
              {!searchTerm && (
                <Link to="/products/new" className="btn btn-primary">
                  <FaPlus />
                  Add Product
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList; 