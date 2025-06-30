import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaReceipt, FaUsers, FaBoxes, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FaReceipt /> },
    { path: '/invoices', label: 'Invoices', icon: <FaReceipt /> },
    { path: '/customers', label: 'Customers', icon: <FaUsers /> },
    { path: '/products', label: 'Products', icon: <FaBoxes /> }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <FaReceipt />
            <span>Harsh Enterprise</span>
          </Link>
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 