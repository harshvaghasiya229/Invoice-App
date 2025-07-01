const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
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

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Import products from Excel file
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
    
    const products = [];
    const errors = [];
    const names = rows.map(row => row[0]).filter(Boolean);
    // Fetch all existing products with these names in one query
    const existingProducts = await Product.find({ name: { $in: names } });
    const existingNames = new Set(existingProducts.map(p => p.name));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || !row[0]) continue; // Skip empty rows
      const productData = {
        name: row[0] || '',           // Products column
        hsnCode: row[1] || '',        // HSN column
        rate: parseFloat(row[2]) || 0, // Price column
        unit: 'Nos',                  // Default unit
        isActive: true                 // Default active status
      };
      // Validate required fields
      if (!productData.name || productData.rate <= 0) {
        errors.push(`Row ${i + 2}: Missing product name or invalid price`);
        continue;
      }
      // Check for duplicates in bulk
      if (existingNames.has(productData.name)) {
        errors.push(`Row ${i + 2}: Product "${productData.name}" already exists`);
        continue;
      }
      products.push(productData);
    }
    // Insert all valid products at once
    let insertedProducts = [];
    if (products.length > 0) {
      try {
        insertedProducts = await Product.insertMany(products, { ordered: false });
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
      message: `Successfully imported ${insertedProducts.length} products`,
      imported: insertedProducts.length,
      errors: errors,
      products: insertedProducts
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
      ['Products', 'HSN', 'Price'],
      ['Sample Product', '998314', '100'],
      ['Another Product', '998315', '50']
    ];
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products-template.xlsx');
    res.send(buffer);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 