import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(10);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${id}`);
        toast.success('Invoice deleted successfully');
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error('Failed to delete invoice');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => {
    return invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           invoice.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           invoice.seller.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage and track all Harsh Enterprise invoices</p>
        </div>
        <Link to="/invoices/new" className="btn btn-primary">
          <FaPlus />
          Create Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Search</label>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by invoice number, customer..."
                className="search-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Results</label>
            <div className="text-sm text-gray-600">
              {filteredInvoices.length} of {invoices.length} invoices
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Invoices</h3>
          <Link to="/invoices/new" className="btn btn-primary">
            <FaPlus />
            Create Invoice
          </Link>
        </div>

        <div className="invoice-list-vertical">
          {currentInvoices.length > 0 ? (
            currentInvoices.map((invoice) => (
              <div key={invoice._id} className="invoice-card-vertical" style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8}}>
                  <div style={{fontWeight: 600, color: '#2563eb', fontSize: 18}}>{invoice.invoiceNumber}</div>
                  <div style={{fontSize: 14, color: '#6b7280'}}>{formatDate(invoice.invoiceDate)}</div>
                </div>
                <div style={{margin: '8px 0 0 0', fontWeight: 500, fontSize: 16}}>{invoice.buyer.name}</div>
                <div style={{fontSize: 13, color: '#6b7280', marginBottom: 8}}>{invoice.buyer.email}</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8}}>
                  <div style={{fontWeight: 700, fontSize: 16}}>{formatCurrency(invoice.grandTotal)}</div>
                  <div className="flex gap-2">
                    <Link
                      to={`/invoices/${invoice._id}`}
                      className="btn btn-outline btn-sm"
                      title="View"
                    >
                      <FaEye />
                    </Link>
                    <Link
                      to={`/invoices/${invoice._id}/edit`}
                      className="btn btn-outline btn-sm"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDelete(invoice._id)}
                      className="btn btn-danger btn-sm"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FaSearch />
              </div>
              <div className="empty-state-title">No invoices found</div>
              <div className="empty-state-description">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Create your first invoice to get started'
                }
              </div>
              {!searchTerm && (
                <Link to="/invoices/new" className="btn btn-primary">
                  <FaPlus />
                  Create Invoice
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card">
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-outline btn-sm"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`btn btn-sm ${
                  currentPage === number ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-outline btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList; 