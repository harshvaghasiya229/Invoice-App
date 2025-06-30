import React, { useState } from 'react';
import { FaUpload, FaDownload, FaFileExcel, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ExcelImport = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setImportResult(null);
      } else {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
        e.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/products/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResult(response.data);
      toast.success(response.data.message);
      
      if (onImportComplete) {
        onImportComplete();
      }
      
      // Reset file input
      setFile(null);
      document.getElementById('file-input').value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload file';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await axios.get('/api/products/template/download', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Import Products from Excel</h3>
        <button
          onClick={downloadTemplate}
          className="btn btn-outline btn-sm"
        >
          <FaDownload />
          Download Template
        </button>
      </div>

      <div className="space-y-4">
        {/* File Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <FaFileExcel className="mx-auto text-4xl text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-gray-600">
              Upload an Excel file (.xlsx or .xls) with product details
            </p>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => document.getElementById('file-input').click()}
              className="btn btn-outline"
            >
              <FaUpload />
              Choose File
            </button>
          </div>
          {file && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">
                <FaCheckCircle className="inline mr-2" />
                Selected: {file.name}
              </p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn btn-primary w-full"
          >
            <FaUpload />
            {uploading ? 'Uploading...' : 'Upload and Import Products'}
          </button>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h4 className="font-semibold text-green-800 mb-2">
                <FaCheckCircle className="inline mr-2" />
                Import Summary
              </h4>
              <p className="text-green-700">
                Successfully imported {importResult.imported} products
              </p>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  <FaExclamationTriangle className="inline mr-2" />
                  Import Errors ({importResult.errors.length})
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <p key={index} className="text-yellow-700 text-sm mb-1">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {importResult.products && importResult.products.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Imported Products
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {importResult.products.map((product, index) => (
                    <div key={product._id} className="text-blue-700 text-sm mb-1">
                      {index + 1}. {product.name} - ₹{product.rate}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Download the template to see the required format</li>
            <li>• Required columns: Products, HSN, Price</li>
            <li>• Products: Product name (required)</li>
            <li>• HSN: HSN/SAC code (optional)</li>
            <li>• Price: Product price in rupees (required)</li>
            <li>• Products with duplicate names will be skipped</li>
            <li>• Empty rows will be ignored</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport; 