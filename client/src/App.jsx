import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './contexts/ShopContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Receipts from './pages/Receipts';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Shops from './pages/Shops';
import Broadcast from './pages/Broadcast';

export default function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected area: redirects to /login when unauthenticated */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/receipts" element={<Receipts />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/broadcast" element={<Broadcast />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Defaults */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ShopProvider>
  );
}
