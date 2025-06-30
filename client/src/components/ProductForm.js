import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hsnCode: '',
    unit: 'Nos',
    rate: 0
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await axios.put(`/api/products/${id}`, formData);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/products', formData);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{id ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="page-subtitle">Fill in the product details below</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/products')}
            className="btn btn-outline"
          >
            <FaTimes />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary"
          >
            <FaSave />
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">HSN Code</label>
              <input
                type="text"
                value={formData.hsnCode}
                onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                className="form-control"
                placeholder="e.g., 998314"
              />
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="form-control"
                rows="3"
                placeholder="Enter product description..."
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Pricing & Units</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="form-control"
              >
                <option value="Nos">Nos</option>
                <option value="Kg">Kg</option>
                <option value="Ltr">Ltr</option>
                <option value="Mtr">Mtr</option>
                <option value="Pcs">Pcs</option>
                <option value="Box">Box</option>
                <option value="Set">Set</option>
                <option value="Pair">Pair</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input
                type="number"
                value={formData.rate}
                onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
                className="form-control"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 