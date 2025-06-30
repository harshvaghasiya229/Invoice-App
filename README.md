# GST Invoice Generator - MERN Stack Application

A comprehensive, responsive GST invoice generation application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This application allows businesses to create, manage, and print professional GST-compliant invoices with automatic tax calculations.

## Features

### 🧾 Invoice Management
- **Create Professional Invoices**: Generate GST-compliant invoices with automatic tax calculations
- **GST Integration**: Automatic CGST, SGST, and IGST calculations based on rates
- **Multiple Items**: Add multiple items with different HSN codes and tax rates
- **Invoice Status Tracking**: Track invoices as Draft, Sent, Paid, or Overdue
- **Invoice History**: Store and manage all previous invoices

### 📊 Dashboard & Analytics
- **Overview Dashboard**: View total invoices, revenue, customers, and products
- **Recent Activity**: Track recent invoices and quick actions
- **Statistics**: Real-time statistics and insights

### 👥 Customer Management
- **Customer Database**: Store and manage customer information
- **GSTIN Integration**: Store customer GSTIN for tax compliance
- **Address Management**: Complete address details with city, state, pincode
- **Search & Filter**: Quick search and filter customers

### 📦 Product Catalog
- **Product Management**: Create and manage product catalog
- **HSN Code Support**: Add HSN codes for tax classification
- **GST Rate Configuration**: Set different GST rates for products
- **Pricing Management**: Manage product rates and units

### 🖨️ Print & Export
- **PDF Generation**: Generate professional PDF invoices
- **Print Support**: Direct printing with optimized layouts
- **Share Functionality**: Share invoices via email or download
- **Print-friendly Design**: Optimized for both screen and print

### 📱 Responsive Design
- **Mobile-First**: Fully responsive design for all devices
- **Modern UI**: Clean, professional interface
- **Cross-Browser**: Works on all modern browsers

## Technology Stack

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **PDFKit**: PDF generation library
- **CORS**: Cross-origin resource sharing

### Frontend
- **React.js**: Frontend JavaScript library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Icons**: Icon library
- **React DatePicker**: Date selection component
- **React Toastify**: Toast notifications
- **HTML2Canvas & jsPDF**: PDF generation on client-side

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd invoice-app
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/invoice-app
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

4. **Start the backend server**
   ```bash
   npm run server
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the React development server**
   ```bash
   npm start
   ```

### Running Both Servers

From the root directory, you can run both servers simultaneously:
```bash
npm run dev
```

## Usage

### Creating an Invoice

1. **Navigate to Dashboard**: Start from the main dashboard
2. **Click "Create Invoice"**: Or go to Invoices → New Invoice
3. **Fill Seller Details**: Enter your company information and GSTIN
4. **Add Customer**: Enter buyer details or select from existing customers
5. **Add Items**: Add products with quantities, rates, and HSN codes
6. **Review Totals**: Check automatic GST calculations
7. **Save Invoice**: Save as draft or mark as sent

### Managing Customers

1. **Go to Customers**: Navigate to the Customers section
2. **Add New Customer**: Click "Add Customer" button
3. **Fill Details**: Enter name, email, phone, address, and GSTIN
4. **Save Customer**: Customer is now available for invoice creation

### Managing Products

1. **Go to Products**: Navigate to the Products section
2. **Add New Product**: Click "Add Product" button
3. **Configure Details**: Set name, description, HSN code, rate, and GST rates
4. **Save Product**: Product is now available for invoice items

### Printing & Sharing

1. **View Invoice**: Open any invoice from the list
2. **Print Options**:
   - **Print**: Direct browser printing
   - **Download PDF**: Generate and download PDF
   - **Share**: Share invoice link or copy to clipboard

## API Endpoints

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get single invoice
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/:id/pdf` - Generate PDF

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## GST Compliance Features

### Tax Calculations
- **CGST (Central GST)**: 9% by default, configurable per product
- **SGST (State GST)**: 9% by default, configurable per product
- **IGST (Integrated GST)**: For inter-state supplies
- **Automatic Totals**: Real-time calculation of subtotals and grand totals

### Invoice Structure
- **GSTIN Display**: Both seller and buyer GSTIN
- **HSN Codes**: Product classification for tax purposes
- **Tax Breakdown**: Clear separation of CGST, SGST, and IGST
- **Amount in Words**: Automatic conversion of amounts to words

## Deployment

### Backend Deployment (Heroku)
1. Create Heroku app
2. Set environment variables
3. Deploy using Git:
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Netlify/Vercel)
1. Build the React app:
   ```bash
   cd client
   npm run build
   ```
2. Deploy the `build` folder to your preferred platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Email invoice functionality
- [ ] Advanced reporting and analytics
- [ ] Multi-currency support
- [ ] Invoice templates customization
- [ ] Bulk operations
- [ ] API rate limiting
- [ ] Data backup and recovery
- [ ] Mobile app development
- [ ] Integration with accounting software 