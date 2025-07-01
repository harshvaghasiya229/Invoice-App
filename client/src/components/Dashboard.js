import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaReceipt, FaUsers, FaBoxes, FaPlus, FaEye } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [invoicesRes, customersRes, productsRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/customers'),
        api.get('/products')
      ]);

      const invoices = invoicesRes.data;
      const customers = customersRes.data;
      const products = productsRes.data;

      const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);

      setStats({
        totalInvoices: invoices.length,
        totalCustomers: customers.length,
        totalProducts: products.length,
        totalRevenue
      });

      setRecentInvoices(invoices.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
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
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to Harsh Enterprise GST Invoice Management System</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalInvoices}</div>
          <div className="stat-label">Total Invoices</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{stats.totalCustomers}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
      </div>

      <div className="quick-actions-section">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link to="/invoices/new" className="quick-action-card primary">
            <div className="quick-action-icon">
              <FaPlus />
            </div>
            <div className="quick-action-content">
              <h4 className="quick-action-title">Create Invoice</h4>
              <p className="quick-action-description">Generate a new GST invoice for your customer</p>
            </div>
            <div className="quick-action-arrow">→</div>
          </Link>
          
          <Link to="/customers/new" className="quick-action-card">
            <div className="quick-action-icon">
              <FaUsers />
            </div>
            <div className="quick-action-content">
              <h4 className="quick-action-title">Add Customer</h4>
              <p className="quick-action-description">Register a new customer to your database</p>
            </div>
            <div className="quick-action-arrow">→</div>
          </Link>
          
          <Link to="/products/new" className="quick-action-card">
            <div className="quick-action-icon">
              <FaBoxes />
            </div>
            <div className="quick-action-content">
              <h4 className="quick-action-title">Add Product</h4>
              <p className="quick-action-description">Add a new product to your catalog</p>
            </div>
            <div className="quick-action-arrow">→</div>
          </Link>
          
          <Link to="/invoices" className="quick-action-card">
            <div className="quick-action-icon">
              <FaReceipt />
            </div>
            <div className="quick-action-content">
              <h4 className="quick-action-title">View Invoices</h4>
              <p className="quick-action-description">Browse and manage all your invoices</p>
            </div>
            <div className="quick-action-arrow">→</div>
          </Link>
        </div>
      </div>

      <div className="recent-activity">
        <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
        {recentInvoices.length > 0 ? (
          <div>
            {recentInvoices.map((invoice) => (
              <div key={invoice._id} className="activity-item" style={{flexWrap: 'wrap'}}>
                <div className="activity-icon" style={{minWidth: 40, minHeight: 40}}>
                  <FaReceipt />
                </div>
                <div className="activity-content" style={{flex: 1, minWidth: 0}}>
                  <div className="activity-title" style={{fontSize: '1rem', wordBreak: 'break-word'}}>
                    {invoice.invoiceNumber} - {invoice.buyer.name}
                  </div>
                  <div className="activity-time" style={{fontSize: '0.9rem'}}>
                    {formatDate(invoice.invoiceDate)} • {formatCurrency(invoice.grandTotal)}
                  </div>
                </div>
                <Link
                  to={`/invoices/${invoice._id}`}
                  className="btn btn-outline btn-sm"
                  style={{marginTop: 8, minWidth: 90}}
                >
                  <FaEye />
                  View
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaReceipt />
            </div>
            <div className="empty-state-title">No invoices yet</div>
            <div className="empty-state-description">
              Create your first invoice to get started
            </div>
            <Link to="/invoices/new" className="btn btn-primary">
              <FaPlus />
              Create Invoice
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 