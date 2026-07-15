import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ScrollToTop from './components/layout/ScrollToTop';

// Storefront Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageShipping from './pages/admin/ManageShipping';
import SalesArchive from './pages/admin/SalesArchive';
import AdminLayout from './components/layout/AdminLayout';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 font-cairo">
          <Navbar />
          <CartDrawer />
          <main className="flex-grow">
            <Routes>
              {/* Public storefront routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/track-order" element={<OrderTracking />} />
              
              {/* Admin login route */}
              <Route path="/admin" element={<AdminLogin />} />
              
              {/* Protected admin routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/products" element={<ManageProducts />} />
                  <Route path="/admin/orders" element={<ManageOrders />} />
                  <Route path="/admin/sales-archive" element={<SalesArchive />} />
                  <Route path="/admin/shipping" element={<ManageShipping />} />
                </Route>
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
