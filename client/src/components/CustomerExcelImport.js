import React, { useState } from 'react';
import { FaUpload, FaDownload, FaFileExcel, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const CustomerExcelImport = ({ onImportComplete }) => {
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
      const response = await axios.post('/api/customers/import-excel', formData, {
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
      document.getElementById('customer-file-input').value = '';
      
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
      const response = await axios.get('/api/customers/template/download', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customers-template.xlsx');
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
        <h3 className="text-lg font-semibold">Import Customers from Excel</h3>
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
              Upload an Excel file (.xlsx or .xls) with customer details
            </p>
            <input
              id="customer-file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => document.getElementById('customer-file-input').click()}
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
            {uploading ? 'Uploading...' : 'Upload and Import Customers'}
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
                Successfully imported {importResult.imported} customers
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

            {importResult.customers && importResult.customers.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Imported Customers
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {importResult.customers.map((customer, index) => (
                    <div key={customer._id} className="text-blue-700 text-sm mb-1">
                      {index + 1}. {customer.name} - {customer.phone}
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
            <li>• Required columns: Business Name, Business Address, Contact Number, GST No</li>
            <li>• Business Name: Company/business name (required)</li>
            <li>• Business Address: Complete business address</li>
            <li>• Contact Number: Phone number</li>
            <li>• GST No: GST identification number</li>
            <li>• Customers with duplicate names or GST numbers will be skipped</li>
            <li>• Empty rows will be ignored</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CustomerExcelImport; 