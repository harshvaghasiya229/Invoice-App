import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date(),
    seller: {
      name: 'Harsh Enterprise',
      address: 'A-7/13, Alok-5, Nirant Cross Road, Vastral, Ahmedabad - 382418',
      gstin: '24AELPV7892J1ZK',
      phone: '9428606712',
      email: 'Not provided'
    },
    buyer: {
      name: '',
      address: '',
      gstin: '',
      phone: '',
      email: 'Not provided'
    },
    items: [{
      description: '',
      hsnCode: '',
      quantity: 1,
      unit: 'Nos',
      rate: 0,
      amount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0
    }],
    subtotal: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    grandTotal: 0,
    amountInWords: '',
    notes: 'Our Bank : Bank of India, Vastral Branch\nA/C No. : 205920110000430\nIFSCN : BKID0002059',
    terms: '1. Goods once sold will not to be returned.\n2. Credit facility is not available.\n3. Check product condition at the time of delivery\n4. All disputes are subject to Gujarat juridiction',
    paymentMethod: 'bank_transfer'
  });

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    if (id) {
      fetchInvoice();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${id}`);
      const invoice = response.data;
      setFormData({
        ...invoice,
        invoiceNumber: invoice.invoiceNumber || '',
        invoiceDate: new Date(invoice.invoiceDate)
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to load invoice');
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Helper to check if buyer is from Gujarat
  const isGujarat = (formData.buyer.gstin || '').trim().startsWith('24');

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Calculate item totals
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const rate = field === 'rate' ? value : newItems[index].rate;
      const amount = quantity * rate;
      let cgst = 0, sgst = 0, igst = 0, total = 0;
      if (isGujarat) {
        cgst = amount * 0.09;
        sgst = amount * 0.09;
        igst = 0;
        total = amount + cgst + sgst;
      } else {
        cgst = 0;
        sgst = 0;
        igst = amount * 0.18;
        total = amount + igst;
      }
      newItems[index] = {
        ...newItems[index],
        amount,
        cgst,
        sgst,
        igst,
        total
      };
    }
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
    calculateTotals(newItems);
  };

  const handleProductSelect = (index, selectedOption) => {
    const selectedProduct = selectedOption ? selectedOption.product : null;
    const newItems = [...formData.items];
    if (selectedProduct) {
      let cgst = 0, sgst = 0, igst = 0, total = 0;
      const amount = (selectedProduct.rate || 0) * 1;
      if (isGujarat) {
        cgst = amount * 0.09;
        sgst = amount * 0.09;
        igst = 0;
        total = amount + cgst + sgst;
      } else {
        cgst = 0;
        sgst = 0;
        igst = amount * 0.18;
        total = amount + igst;
      }
      newItems[index] = {
        ...newItems[index],
        description: selectedProduct.name,
        hsnCode: selectedProduct.hsnCode || '',
        unit: selectedProduct.unit || 'Nos',
        rate: selectedProduct.rate || 0,
        quantity: 1,
        amount,
        cgst,
        sgst,
        igst,
        total
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        description: '',
        hsnCode: '',
        unit: 'Nos',
        rate: 0,
        amount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 0
      };
    }
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
    calculateTotals(newItems);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        hsnCode: '',
        quantity: 1,
        unit: 'Nos',
        rate: 0,
        amount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 0
      }]
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
    calculateTotals(newItems);
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const cgstTotal = items.reduce((sum, item) => sum + item.cgst, 0);
    const sgstTotal = items.reduce((sum, item) => sum + item.sgst, 0);
    const igstTotal = items.reduce((sum, item) => sum + item.igst, 0);
    const grandTotal = subtotal + cgstTotal + sgstTotal + igstTotal;
    setFormData(prev => ({
      ...prev,
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      grandTotal,
      amountInWords: numberToWords(grandTotal)
    }));
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanOneThousand = (num) => {
      if (num === 0) return '';

      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
      if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convertLessThanOneThousand(num % 100) : '');
    };

    const convert = (num) => {
      if (num === 0) return 'Zero Rupees Only';
      if (num < 1000) return convertLessThanOneThousand(num) + ' Rupees Only';
      if (num < 100000) return convertLessThanOneThousand(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertLessThanOneThousand(num % 1000) : '') + ' Rupees Only';
      if (num < 10000000) return convertLessThanOneThousand(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + convert(Math.floor(num / 1000) % 100) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertLessThanOneThousand(num % 1000) : '') : '') + ' Rupees Only';
      return convertLessThanOneThousand(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + convert(num % 10000000) : '') + ' Rupees Only';
    };

    return convert(Math.floor(num));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.buyer.name || !formData.buyer.address) {
        toast.error('Please fill in all required buyer details');
        setLoading(false);
        return;
      }

      if (formData.items.length === 0 || !formData.items[0].description) {
        toast.error('Please add at least one item to the invoice');
        setLoading(false);
        return;
      }

      if (id) {
        await api.put(`/invoices/${id}`, formData);
        toast.success('Invoice updated successfully');
      } else {
        await api.post('/invoices', formData);
        toast.success('Invoice created successfully');
      }
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Failed to save invoice: ${error.response.data.message}`);
      } else {
        toast.error('Failed to save invoice. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{id ? 'Edit Invoice' : 'Create New Invoice'}</h1>
          <p className="page-subtitle">Fill in the details below to create a professional Harsh Enterprise GST invoice</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/invoices')}
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
            {loading ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Invoice Number</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                className="form-control"
                placeholder="Enter invoice number (optional)"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Invoice Date</label>
              <DatePicker
                selected={formData.invoiceDate}
                onChange={(date) => setFormData(prev => ({ ...prev, invoiceDate: date }))}
                className="form-control"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>
        </div>

        {/* Seller Details */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Seller Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div className="seller-info-display">{formData.seller.name}</div>
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <div className="seller-info-display">{formData.seller.gstin}</div>
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">Address</label>
              <div className="seller-info-display">{formData.seller.address}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <div className="seller-info-display">{formData.seller.phone}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="seller-info-display">{formData.seller.email || 'Not provided'}</div>
            </div>
          </div>
        </div>

        {/* Buyer Details */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Buyer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <Select
                classNamePrefix="react-select"
                options={customers.map(c => ({ value: c._id, label: c.name, customer: c }))}
                value={formData.buyer.name ? { label: formData.buyer.name, value: formData.buyer._id } : null}
                onChange={option => {
                  const selected = option ? option.customer : null;
                  setFormData(prev => ({
                    ...prev,
                    buyer: selected ? {
                      name: selected.name,
                      address: selected.address,
                      gstin: selected.gstin,
                      phone: selected.phone,
                      email: 'Not provided'
                    } : {
                      name: '', address: '', gstin: '', phone: '', email: 'Not provided'
                    }
                  }));
                }}
                placeholder="Select customer..."
                isClearable
                isSearchable
              />
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input
                type="text"
                value={formData.buyer.gstin}
                onChange={e => handleInputChange('buyer', 'gstin', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">Address</label>
              <textarea
                value={formData.buyer.address}
                onChange={e => handleInputChange('buyer', 'address', e.target.value)}
                className="form-control"
                rows="3"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                value={formData.buyer.phone}
                onChange={e => handleInputChange('buyer', 'phone', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={formData.buyer.email || 'Not provided'}
                onChange={e => handleInputChange('buyer', 'email', e.target.value)}
                className="form-control"
                placeholder="Not provided"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="btn btn-outline"
            >
              <FaPlus />
              Add Item
            </button>
          </div>

          <div className="table-responsive" style={{overflowX: 'auto', display: 'block'}}>
            <table className="table invoice-items-table" style={{minWidth: 700}}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>HSN Code</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  {isGujarat ? (
                    <>
                      <th>CGST</th>
                      <th>SGST</th>
                    </>
                  ) : (
                    <th>IGST</th>
                  )}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} className="invoice-item-row">
                    <td colSpan={9} style={{padding: 0, border: 'none'}}>
                      <div className="invoice-item-fields" style={{display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end'}}>
                        <div style={{flex: '2 1 180px', minWidth: 120}}>
                          <Select
                            classNamePrefix="react-select"
                            options={products.map(p => ({ value: p._id, label: `${p.name} - ₹${p.rate}`, product: p }))}
                            value={item.description ? { label: item.description, value: item._id } : null}
                            onChange={(option) => handleProductSelect(index, option)}
                            placeholder="Select product..."
                            isClearable
                            isSearchable
                            noOptionsMessage={() => "No products found"}
                            loadingMessage={() => "Loading products..."}
                            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                            menuPosition="fixed"
                            styles={{
                              control: (base) => ({ ...base, minHeight: 38 }),
                              menu: (base) => ({ ...base, zIndex: 999999 }),
                              valueContainer: (base) => ({ ...base, whiteSpace: 'normal' }),
                              singleValue: (base) => ({ ...base, whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '100%' }),
                              input: (base) => ({ ...base, whiteSpace: 'normal' })
                            }}
                          />
                        </div>
                        <div style={{flex: '1 1 80px', minWidth: 80}}>
                          <input
                            type="text"
                            value={item.hsnCode}
                            onChange={e => handleItemChange(index, 'hsnCode', e.target.value)}
                            className="form-control"
                            placeholder="HSN Code"
                          />
                        </div>
                        <div style={{flex: '1 1 60px', minWidth: 60}}>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="form-control"
                            min="1"
                            required
                          />
                        </div>
                        <div style={{flex: '1 1 80px', minWidth: 80}}>
                          <select
                            value={item.unit}
                            onChange={e => handleItemChange(index, 'unit', e.target.value)}
                            className="form-control"
                          >
                            <option value="Nos">Nos</option>
                            <option value="Kg">Kg</option>
                            <option value="Ltr">Ltr</option>
                            <option value="Mtr">Mtr</option>
                            <option value="Pcs">Pcs</option>
                            <option value="Box">Box</option>
                            <option value="Set">Set</option>
                          </select>
                        </div>
                        <div style={{flex: '1 1 80px', minWidth: 80}}>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={e => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                            className="form-control"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div style={{flex: '1 1 80px', minWidth: 80, textAlign: 'right', fontWeight: 500}}>{formatCurrency(item.amount)}</div>
                        {isGujarat ? (
                          <>
                            <div style={{flex: '1 1 80px', minWidth: 80, textAlign: 'right'}}>{formatCurrency(item.cgst)}</div>
                            <div style={{flex: '1 1 80px', minWidth: 80, textAlign: 'right'}}>{formatCurrency(item.sgst)}</div>
                          </>
                        ) : (
                          <div style={{flex: '1 1 80px', minWidth: 80, textAlign: 'right'}}>{formatCurrency(item.igst)}</div>
                        )}
                        <div style={{flex: '1 1 80px', minWidth: 80, textAlign: 'right', fontWeight: 600}}>{formatCurrency(item.total)}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Remove Item Button - Only show if more than one item */}
          {formData.items.length > 1 && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => removeItem(formData.items.length - 1)}
                className="btn btn-danger btn-sm"
              >
                <FaTrash className="mr-2 h-4 w-4" />
                Remove Last Item
              </button>
            </div>
          )}
        </div>

        {/* Totals and Notes */}
        <div className="card">
          <div className="invoice-notes-terms-section" style={{display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12, marginBottom: 12}}>
            <div>
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <div style={{
                whiteSpace: 'pre-line',
                background: '#e8f1fd',
                border: '1.5px solid #3b82f6',
                borderLeft: '6px solid #2563eb',
                borderRadius: 10,
                padding: '18px 18px 18px 22px',
                color: '#1e293b',
                fontSize: '1.08rem',
                fontWeight: 500,
                lineHeight: 1.7,
                marginBottom: 0,
                letterSpacing: 0.1,
                boxShadow: '0 2px 8px rgba(59,130,246,0.07)'
              }}>
                {formData.notes}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Terms & Conditions</h3>
              <div style={{
                whiteSpace: 'pre-line',
                background: '#fff7ed',
                border: '1.5px solid #fb923c',
                borderLeft: '6px solid #ea580c',
                borderRadius: 10,
                padding: '18px 18px 18px 22px',
                color: '#7c2d12',
                fontSize: '1.08rem',
                fontWeight: 700,
                lineHeight: 1.7,
                marginBottom: 0,
                letterSpacing: 0.1,
                boxShadow: '0 2px 8px rgba(251,146,60,0.07)'
              }}>
                {formData.terms}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex justify-end">
              <div className="w-full md:w-1/2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(formData.subtotal)}</span>
                  </div>
                  {isGujarat ? (
                    <>
                      <div className="flex justify-between">
                        <span>CGST (9%):</span>
                        <span>{formatCurrency(formData.cgstTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST (9%):</span>
                        <span>{formatCurrency(formData.sgstTotal)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>IGST (18%):</span>
                      <span>{formatCurrency(formData.igstTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(formData.grandTotal)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {formData.amountInWords}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm; 