import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPrint, FaDownload, FaEdit, FaArrowLeft, FaShare } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './InvoiceView.css';

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to load invoice');
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: `Invoice ${invoice.invoiceNumber} for ${invoice.buyer.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
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

  if (!invoice) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Invoice not found</div>
        <button onClick={() => navigate('/invoices')} className="btn btn-primary">
          <FaArrowLeft />
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="invoice-view">
      {/* Action Bar */}
      <div className="action-bar no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/invoices')}
            className="btn btn-outline"
          >
            <FaArrowLeft />
            Back
          </button>
          <button
            onClick={() => navigate(`/invoices/${id}/edit`)}
            className="btn btn-outline"
          >
            <FaEdit />
            Edit
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="btn btn-outline"
          >
            <FaShare />
            Share
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-outline"
          >
            <FaDownload />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-primary"
          >
            <FaPrint />
            Print
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="invoice-content" id="invoice-content">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-title">
            <h1>TAX INVOICE</h1>
            <div className="invoice-number">
              Invoice No: {invoice.invoiceNumber}
            </div>
          </div>
          <div className="invoice-details">
            <div className="detail-row">
              <span className="label">Date:</span>
              <span>{formatDate(invoice.invoiceDate)}</span>
            </div>
          </div>
        </div>

        {/* Seller and Buyer Details */}
        <div className="parties-section">
          <div className="party-details seller">
            <h3>SELLER</h3>
            <div className="party-info">
              <div className="party-name">{invoice.seller.name}</div>
              <div className="party-address">{invoice.seller.address}</div>
              <div className="party-gstin">GSTIN: {invoice.seller.gstin}</div>
              {invoice.seller.phone && (
                <div className="party-contact">Phone: {invoice.seller.phone}</div>
              )}
              {invoice.seller.email && (
                <div className="party-contact">Email: {invoice.seller.email}</div>
              )}
            </div>
          </div>

          <div className="party-details buyer">
            <h3>BUYER</h3>
            <div className="party-info">
              <div className="party-name">{invoice.buyer.name}</div>
              <div className="party-address">{invoice.buyer.address}</div>
              {invoice.buyer.gstin && (
                <div className="party-gstin">GSTIN: {invoice.buyer.gstin}</div>
              )}
              {invoice.buyer.phone && (
                <div className="party-contact">Phone: {invoice.buyer.phone}</div>
              )}
              {invoice.buyer.email && (
                <div className="party-contact">Email: {invoice.buyer.email}</div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="items-section">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Description</th>
                <th>HSN Code</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>CGST (9%)</th>
                <th>SGST (9%)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.description}</td>
                  <td>{item.hsnCode || '-'}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>{formatCurrency(item.rate)}</td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{formatCurrency(item.cgst)}</td>
                  <td>{formatCurrency(item.sgst)}</td>
                  <td>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="totals-section">
          <div className="totals-table">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="total-row">
              <span>CGST Total:</span>
              <span>{formatCurrency(invoice.cgstTotal)}</span>
            </div>
            <div className="total-row">
              <span>SGST Total:</span>
              <span>{formatCurrency(invoice.sgstTotal)}</span>
            </div>
            <div className="total-row">
              <span>IGST Total:</span>
              <span>{formatCurrency(invoice.igstTotal)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Grand Total:</span>
              <span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
            <div className="amount-words">
              {invoice.amountInWords}
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="notes-section">
            {invoice.notes && (
              <div className="notes">
                <h4>Notes:</h4>
                <p>{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div className="terms">
                <h4>Terms & Conditions:</h4>
                <p>{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="invoice-footer">
          <div className="footer-content">
            <p>Thank you for your business!</p>
            <p>Harsh Enterprise - Professional GST Invoice</p>
            <p>This is a computer generated invoice</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView; 