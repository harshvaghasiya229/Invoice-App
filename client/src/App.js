import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import InvoiceView from './components/InvoiceView';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/:id" element={<InvoiceView />} />
            <Route path="/invoices/:id/edit" element={<InvoiceForm />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
          </Routes>
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App; 