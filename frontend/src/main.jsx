import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './All_Components/screen/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import PaymentModal from './All_Components/screen/PaymentModal';
import { PaymentModalProvider } from './context/PaymentModalContext';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
        <AdminAuthProvider>
         <PaymentModalProvider>
      <App />
      <PaymentModal /> 
    </PaymentModalProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
);