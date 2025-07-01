// API Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
  },
  production: {
    API_BASE_URL: 'https://invoice-app-backend-xr3h.onrender.com/api',
  },
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL;

export default config[environment]; 