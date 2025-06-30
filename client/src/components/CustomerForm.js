import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    pan: ''
  });

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await axios.get(`/api/customers/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Failed to load customer');
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
        await axios.put(`/api/customers/${id}`, formData);
        toast.success('Customer updated successfully');
      } else {
        await axios.post('/api/customers', formData);
        toast.success('Customer created successfully');
      }
      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{id ? 'Edit Customer' : 'Add New Customer'}</h1>
          <p className="page-subtitle">Fill in the customer details below</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/customers')}
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
            {loading ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleInputChange('gstin', e.target.value)}
                className="form-control"
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
            <div className="form-group">
              <label className="form-label">PAN</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => handleInputChange('pan', e.target.value)}
                className="form-control"
                placeholder="ABCDE1234F"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Address Information</h3>
          <div className="form-group">
            <label className="form-label">Business Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="form-control"
              rows="4"
              placeholder="Enter complete business address..."
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm; 