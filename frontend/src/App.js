import React, { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { api } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";
import { CartDrawer } from "@/components/CartDrawer";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import Collections from "@/pages/Collections";
import ProductDetail from "@/pages/ProductDetail";
import About from "@/pages/About";
import ComingSoon from "@/pages/ComingSoon";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Account from "@/pages/Account";
import Wishlist from "@/pages/Wishlist";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Checkout from "@/pages/Checkout";
import Payment from "@/pages/Payment";
import Confirmation from "@/pages/Confirmation";
import NotFound from "@/pages/NotFound";

import AdminShell from "@/pages/admin/AdminShell";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminOrders from "@/pages/admin/Orders";
import AdminOrderDetail from "@/pages/admin/OrderDetail";
import AdminCategories from "@/pages/admin/Categories";
import AdminSettings from "@/pages/admin/Settings";
import AdminCustomers from "@/pages/admin/Customers";
import AdminDiscounts from "@/pages/admin/Discounts";
import AdminActivity from "@/pages/admin/Activity";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminTestimonials from "@/pages/admin/Testimonials";

const Shell = ({ settings, children }) => (
  <>
    <Nav settings={settings} />
    <main>{children}</main>
    <Footer settings={settings} />
    <CartDrawer />
  </>
);

function App() {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="bottom-right" theme="dark" />
            <CustomCursor />
            <Routes>
              <Route path="/" element={<Shell settings={settings}><Home settings={settings} /></Shell>} />
              <Route path="/collections" element={<Shell settings={settings}><Collections /></Shell>} />
              <Route path="/collections/:slug" element={<Shell settings={settings}><Collections /></Shell>} />
              <Route path="/product/:slug" element={<Shell settings={settings}><ProductDetail /></Shell>} />
              <Route path="/about" element={<Shell settings={settings}><About /></Shell>} />
              <Route path="/coming-soon" element={<Shell settings={settings}><ComingSoon /></Shell>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/account" element={<ProtectedRoute><Shell settings={settings}><Account /></Shell></ProtectedRoute>} />
              <Route path="/account/wishlist" element={<ProtectedRoute><Shell settings={settings}><Wishlist /></Shell></ProtectedRoute>} />
              <Route path="/account/orders" element={<ProtectedRoute><Shell settings={settings}><Orders /></Shell></ProtectedRoute>} />
              <Route path="/account/orders/:id" element={<ProtectedRoute><Shell settings={settings}><OrderDetail /></Shell></ProtectedRoute>} />

              <Route path="/checkout" element={<ProtectedRoute><Shell settings={settings}><Checkout /></Shell></ProtectedRoute>} />
              <Route path="/checkout/payment/:id" element={<ProtectedRoute><Shell settings={settings}><Payment settings={settings} /></Shell></ProtectedRoute>} />
              <Route path="/checkout/confirmation/:id" element={<ProtectedRoute><Shell settings={settings}><Confirmation /></Shell></ProtectedRoute>} />

              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminShell /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<AdminOrderDetail />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="discounts" element={<AdminDiscounts />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="activity" element={<AdminActivity />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<Shell settings={settings}><NotFound /></Shell>} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
