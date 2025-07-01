import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaFileExcel, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';
import CustomerExcelImport from './CustomerExcelImport';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error('Failed to delete customer');
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.gstin && customer.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage Harsh Enterprise customer database</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(!showImport)}
            className="btn btn-outline"
          >
            <FaFileExcel />
            {showImport ? 'Hide Import' : 'Import Excel'}
          </button>
          <Link to="/customers/new" className="btn btn-primary">
            <FaPlus />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Excel Import Section */}
      {showImport && (
        <div className="mb-6">
          <CustomerExcelImport onImportComplete={fetchCustomers} />
        </div>
      )}

      {/* Search */}
      <div className="card">
        <div className="form-group">
          <label className="form-label">Search Customers</label>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or GSTIN..."
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="customers-grid">
        {filteredCustomers.map((customer) => (
          <div key={customer._id} className="customer-card">
            {/* Card Header */}
            <div className="customer-card-header">
              <div className="customer-info">
                <h3 className="customer-name">{customer.name}</h3>
              </div>
              <div className="customer-actions">
                <Link
                  to={`/customers/${customer._id}/edit`}
                  className="btn btn-outline btn-sm"
                  title="Edit Customer"
                >
                  <FaEdit />
                </Link>
                <button
                  onClick={() => handleDelete(customer._id)}
                  className="btn btn-danger btn-sm"
                  title="Delete Customer"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            {/* Card Content */}
            <div className="customer-card-content">
              {customer.phone && (
                <div className="customer-detail">
                  <FaPhone className="customer-detail-icon" />
                  <span className="customer-detail-label">Phone:</span>
                  <span className="customer-detail-value">{customer.phone}</span>
                </div>
              )}
              {customer.gstin && (
                <div className="customer-detail">
                  <FaIdCard className="customer-detail-icon" />
                  <span className="customer-detail-label">GSTIN:</span>
                  <span className="customer-detail-value">{customer.gstin}</span>
                </div>
              )}
              {customer.address && (
                <div className="customer-detail">
                  <FaMapMarkerAlt className="customer-detail-icon" />
                  <span className="customer-detail-label">Address:</span>
                  <p className="customer-detail-value customer-address">{customer.address}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FaSearch />
          </div>
          <div className="empty-state-title">No customers found</div>
          <div className="empty-state-description">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Add your first customer to get started'
            }
          </div>
          {!searchTerm && (
            <Link to="/customers/new" className="btn btn-primary">
              <FaPlus />
              Add Customer
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerList; 