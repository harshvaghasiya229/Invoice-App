const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate PDF
router.get('/:id/pdf', async (req, res) => {
  let doc;
  try {
    // Fetch invoice WITHOUT populate
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    // === PDF HEADER ===
    const pageWidth = doc.page.width;
    const margin = 36;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;
    // Firm name
    doc.fontSize(15).font('Helvetica-Bold').text('HARSH ENTERPRISE', margin, yPos, { width: contentWidth, align: 'center' });
    yPos += 18;
    // Tax Invoice title
    doc.fontSize(11).font('Helvetica-Bold').text('TAX INVOICE', margin, yPos, { width: contentWidth, align: 'center' });
    yPos += 14;
    // Invoice number and date (right)
    const invoiceDate = invoice.invoiceDate || invoice.date;
    doc.fontSize(11).font('Helvetica-Bold').text(`Invoice No: ${invoice.invoiceNumber || ''}    Date: ${invoiceDate ? new Date(invoiceDate).toLocaleDateString() : ''}`, margin, yPos, { width: contentWidth, align: 'right' });
    yPos += 14;
    // Divider
    doc.moveTo(margin, yPos).lineTo(pageWidth - margin, yPos).strokeColor('#ccc').stroke();
    yPos += 4;
    // === SELLER & BUYER DETAILS (GRID) ===
    const colWidth = (contentWidth - 16) / 2;
    // Calculate seller and buyer details heights first
    let sellerY = yPos + 18;
    let tempSellerY = sellerY;
    const seller = invoice.seller || {};
    doc.font('Helvetica-Bold').fontSize(9);
    tempSellerY += 12; // Name
    tempSellerY += doc.heightOfString(seller.address || '', { width: colWidth - 54, font: 'Helvetica-Bold', size: 9 }) + 4; // Address
    tempSellerY += 12; // GSTIN
    tempSellerY += 12; // Phone
    tempSellerY += 12; // Email
    let buyerY = yPos + 18;
    let tempBuyerY = buyerY;
    const buyer = invoice.buyer || {};
    doc.font('Helvetica-Bold').fontSize(9);
    tempBuyerY += 12; // Name
    tempBuyerY += doc.heightOfString(buyer.address || 'N/A', { width: colWidth - 54, font: 'Helvetica-Bold', size: 9 }) + 4; // Address
    tempBuyerY += 12; // GSTIN
    tempBuyerY += 12; // Phone
    tempBuyerY += 12; // Email
    const detailsBoxBottom = Math.max(tempSellerY, tempBuyerY) + 8;
    const detailsBoxHeight = detailsBoxBottom - yPos;
    // Draw the background box after calculating height
    doc.rect(margin, yPos, contentWidth, detailsBoxHeight).fill('#f7f7f7');
    doc.fillColor('#000');
    // Print seller and buyer details
    // Add subheading for Seller
    doc.font('Helvetica-Bold').fontSize(10).text('Seller Details', margin + 4, yPos + 4, { width: colWidth - 8 });
    sellerY = yPos + 18;
    doc.font('Helvetica-Bold').fontSize(9).text(`Name: ${seller.name || 'N/A'}`, margin + 4, sellerY, { width: colWidth - 8 });
    sellerY += 12;
    doc.font('Helvetica-Bold').fontSize(9).text(`Address:`, margin + 4, sellerY, { width: 45 });
    doc.font('Helvetica-Bold').fontSize(9).text(seller.address || 'N/A', margin + 50, sellerY, { width: colWidth - 54 });
    sellerY += doc.heightOfString(seller.address || 'N/A', { width: colWidth - 54, font: 'Helvetica-Bold', size: 9 }) + 4;
    doc.font('Helvetica-Bold').fontSize(9).text(`GSTIN: ${seller.gstin || 'N/A'}`, margin + 4, sellerY, { width: colWidth - 8 });
    sellerY += 12;
    doc.font('Helvetica-Bold').fontSize(9).text(`Phone: ${seller.phone || 'N/A'}`, margin + 4, sellerY, { width: colWidth - 8 });
    sellerY += 12;
    doc.font('Helvetica-Bold').fontSize(9).text(`Email: ${seller.email || 'N/A'}`, margin + 4, sellerY, { width: colWidth - 8 });
    // Add subheading for Buyer
    doc.font('Helvetica-Bold').fontSize(10).text('Buyer Details', margin + colWidth + 12, yPos + 4, { width: colWidth - 8 });
    buyerY = yPos + 18;
    doc.font('Helvetica-Bold').fontSize(9).text(`Name: ${buyer.name || 'N/A'}`, margin + colWidth + 12, buyerY, { width: colWidth - 8 });
    buyerY += 12;
    doc.font('Helvetica-Bold').fontSize(9).text(`Address:`, margin + colWidth + 12, buyerY, { width: 45 });
    doc.font('Helvetica-Bold').fontSize(9).text((buyer.address || 'N/A'), margin + colWidth + 12 + 46, buyerY, { width: colWidth - 54 });
    buyerY += doc.heightOfString(buyer.address || 'N/A', { width: colWidth - 54, font: 'Helvetica-Bold', size: 9 }) + 4;
    doc.font('Helvetica-Bold').fontSize(9).text(`GSTIN: ${buyer.gstin || 'N/A'}`, margin + colWidth + 12, buyerY, { width: colWidth - 8 });
    buyerY += 12;
    doc.font('Helvetica-Bold').fontSize(9).text(`Phone: ${buyer.phone || 'N/A'}`, margin + colWidth + 12, buyerY, { width: colWidth - 8 });
    buyerY += 12;
    doc.font('Helvetica-Bold').fontSize(9).text(`Email: ${buyer.email || 'N/A'}`, margin + colWidth + 12, buyerY, { width: colWidth - 8 });
    yPos = detailsBoxBottom;
    // Divider
    doc.moveTo(margin, yPos).lineTo(pageWidth - margin, yPos).strokeColor('#ccc').stroke();
    yPos += 4;
    // === ITEMIZED TABLE ===
    // Determine if IGST should be included
    const buyerGstin = (buyer.gstin || '').trim();
    const showIGST = !(buyerGstin.startsWith('24'));
    // Table header
    const tableHeaders = showIGST
      ? ['Sr.', 'Item Description', 'HSN', 'Qty', 'Rate', 'Amount', 'IGST', 'Total']
      : ['Sr.', 'Item Description', 'HSN', 'Qty', 'Rate', 'Amount', 'Total'];
    const colWidths = showIGST
      ? [18, 90, 32, 22, 36, 38, 38, 38]
      : [18, 90, 32, 22, 36, 38, 38];
    let x = margin;
    doc.rect(margin, yPos, contentWidth, 13).fill('#f0f0f0');
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(10);
    tableHeaders.forEach((h, i) => {
      const align = i > 2 ? 'right' : 'left';
      doc.text(h, x, yPos + 2, { width: colWidths[i], align });
      x += colWidths[i];
    });
    doc.fillColor('#000');
    yPos += 13;
    // Table rows
    doc.font('Helvetica').fontSize(9);
    invoice.items.forEach((item, idx) => {
      x = margin;
      const row = showIGST
        ? [
            idx + 1,
            item.description,
            item.hsnCode,
            item.quantity,
            Number(item.rate).toFixed(0),
            Number(item.amount).toFixed(0),
            Number(showIGST ? item.igst : 0).toFixed(2),
            Number(item.total).toFixed(0)
          ]
        : [
            idx + 1,
            item.description,
            item.hsnCode,
            item.quantity,
            Number(item.rate).toFixed(0),
            Number(item.amount).toFixed(0),
            Number(item.total).toFixed(0)
          ];
      row.forEach((cell, i) => {
        const align = i > 2 ? 'right' : 'left';
        doc.text(String(cell), x, yPos + 1, { width: colWidths[i], align });
        x += colWidths[i];
      });
      // Row border
      doc.moveTo(margin, yPos + 11).lineTo(pageWidth - margin, yPos + 11).strokeColor('#eee').stroke();
      yPos += 11;
    });
    yPos += 4;
    // === TOTALS SECTION ===
    const sanitized = {
      subtotal: parseFloat(invoice.subtotal) || 0,
      cgstTotal: parseFloat(invoice.cgstTotal) || 0,
      sgstTotal: parseFloat(invoice.sgstTotal) || 0,
      igstTotal: showIGST ? (parseFloat(invoice.igstTotal) || 0) : 0,
      grandTotal: parseFloat(invoice.grandTotal) || 0,
    };
    doc.font('Helvetica-Bold').fontSize(8);
    const totalLabels = [
      ['Subtotal', sanitized.subtotal],
      ['CGST Total', sanitized.cgstTotal],
      ['SGST Total', sanitized.sgstTotal],
    ];
    if (showIGST) {
      totalLabels.push(['IGST Total', sanitized.igstTotal]);
    }
    totalLabels.push(['Grand Total', sanitized.grandTotal]);
    totalLabels.forEach(([label, value], i) => {
      doc.text(`${label}: ${Number(value).toFixed(0)}`, margin, yPos, { width: contentWidth, align: 'right' });
      yPos += 10;
    });
    // Amount in words
    const amountWords = typeof invoice.amountInWords === 'string' ? invoice.amountInWords : 'N/A';
    doc.font('Helvetica').fontSize(7).text(`Amount in Words: ${amountWords}`, margin, yPos, { width: contentWidth, align: 'left' });
    yPos += 10;
    // === BANK DETAILS & TERMS (with backgrounds) ===
    // Bank Details box
    const bankBoxHeight = 22 + (invoice.notes ? invoice.notes.split('\n').length * 10 : 10);
    doc.rect(margin, yPos, contentWidth, bankBoxHeight).fill('#f7f7fa');
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(10).text('Bank Details:', margin + 4, yPos + 3);
    doc.font('Helvetica').fontSize(9).text(invoice.notes || '', margin + 4, yPos + 15, { width: contentWidth - 8 });
    yPos += bankBoxHeight + 6;
    // Terms box
    const termsBoxHeight = 22 + (invoice.terms ? invoice.terms.split('\n').length * 10 : 10);
    doc.rect(margin, yPos, contentWidth, termsBoxHeight).fill('#f7f7fa');
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(10).text('Terms & Conditions:', margin + 4, yPos + 3);
    if (invoice.terms) {
      invoice.terms.split('\n').forEach((t, i) => {
        doc.font('Helvetica').fontSize(9).text(`• ${t}`, margin + 10, yPos + 15 + i * 10, { width: contentWidth - 16 });
      });
    }
    yPos += termsBoxHeight + 6;
    // === FOOTER ===
    doc.fontSize(7).fillColor('#888').text('Thank you for your business!', margin, doc.page.height - 18, { align: 'center', width: contentWidth });
    doc.end();
  } catch (err) {
    console.error('PDFKit error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'PDF generation failed', error: err.message });
    }
  }
});

module.exports = router; 