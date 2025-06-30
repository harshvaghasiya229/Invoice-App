const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true,
    required: false
  },
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  seller: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    gstin: { type: String, required: true },
    phone: { type: String },
    email: { type: String }
  },
  buyer: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    gstin: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  items: [{
    description: { type: String, required: true },
    hsnCode: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'Nos' },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    total: { type: Number, required: true }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  cgstTotal: {
    type: Number,
    default: 0
  },
  sgstTotal: {
    type: Number,
    default: 0
  },
  igstTotal: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true
  },
  amountInWords: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  terms: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'cheque', 'bank_transfer', 'upi', 'card'],
    default: 'bank_transfer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate invoice number only if not provided
InvoiceSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.invoiceNumber) {
      const count = await this.constructor.countDocuments();
      const year = new Date().getFullYear();
      this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Invoice', InvoiceSchema); 