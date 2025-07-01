const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  }
});

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Import customers from Excel file
router.post('/import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Remove header row and process data
    const headers = data[0];
    const rows = data.slice(1);
    
    const customers = [];
    const errors = [];
    const names = rows.map(row => row[0]).filter(Boolean);
    const gstins = rows.map(row => row[3]).filter(Boolean);
    // Fetch all existing customers with these names or GSTINs in one query
    const existingCustomers = await Customer.find({
      $or: [
        { name: { $in: names } },
        { gstin: { $in: gstins } }
      ]
    });
    const existingNames = new Set(existingCustomers.map(c => c.name));
    const existingGstins = new Set(existingCustomers.map(c => c.gstin));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || !row[0]) continue; // Skip empty rows
      const customerData = {
        name: row[0] || '',           // Business Name column
        address: row[1] || '',        // Business Address column
        phone: row[2] || '',          // Contact Number column
        gstin: row[3] || '',          // GST No column
        email: `customer${Date.now()}_${i}@example.com`, // Generate unique email
        isActive: true                 // Default active status
      };
      // Validate required fields
      if (!customerData.name) {
        errors.push(`Row ${i + 2}: Missing business name`);
        continue;
      }
      // Check for duplicates in bulk
      if (existingNames.has(customerData.name) || (customerData.gstin && existingGstins.has(customerData.gstin))) {
        errors.push(`Row ${i + 2}: Customer "${customerData.name}" already exists`);
        continue;
      }
      customers.push(customerData);
    }
    // Insert all valid customers at once
    let insertedCustomers = [];
    if (customers.length > 0) {
      try {
        insertedCustomers = await Customer.insertMany(customers, { ordered: false });
      } catch (bulkErr) {
        // If some inserts fail, collect errors
        if (bulkErr.writeErrors) {
          bulkErr.writeErrors.forEach(e => {
            errors.push(`Bulk insert error: ${e.errmsg}`);
          });
        }
      }
    }
    // Clean up uploaded file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);
    res.json({
      message: `Successfully imported ${insertedCustomers.length} customers`,
      imported: insertedCustomers.length,
      errors: errors,
      customers: insertedCustomers
    });
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file) {
      const fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    res.status(500).json({ message: err.message });
  }
});

// Get Excel template
router.get('/template/download', (req, res) => {
  try {
    const templateData = [
      ['Business Name', 'Business Address', 'Contact Number', 'GST No'],
      ['ABC Company Ltd', '123 Business Street, City, State - 123456', '9876543210', '22AAAAA0000A1Z5'],
      ['XYZ Corporation', '456 Corporate Avenue, City, State - 654321', '1234567890', '33BBBBB0000B2Z6']
    ];
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=customers-template.xlsx');
    res.send(buffer);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 