import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from './Pages/ProductList';
import ProductListBySubCategories from './Pages/ProductListBySubCategories';
import Login from './Pages/Login';
import Signup from './Pages/SignUp';
import AboutUs from './Pages/AboutUs';
import Profile from './Pages/Profile';
import Category from './Pages/Category';
import ProductPage from './Pages/ProductPage';
import CompleteProfile from './Pages/CompleteProfile';
import Wishlist from './Pages/WishlistPage';
import CartPage from './Pages/CartPage';
import CheckoutPage from './Pages/CheckoutPage';
import PaymentSuccessPage from './Pages/PaymentSuccessPage';
import OrderSummaryPage from './Pages/OrderSummary';
import ProtectedRoute from './ProtectedRoute';
import PaymentPage from './Pages/Payment';
import OrderPage from './Pages/OrderPage';
import SearchList from './Components/Shared/SearchList';
import MobileSearchPage from './Pages/MobileSearchPage';
import AdminRoute from './AdminRoute';
import Admin from './Pages/Admin';
import RefundPolicy from './Pages/RefundPolicy';
import ProductDetail from './Pages/AdminPage/ProductDetail';
import AdminProductForm from './Pages/AdminPage/AddProductForm';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/productlist" element={<ProductList />} />
        <Route path="/productlistsub" element={<ProductListBySubCategories />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> {/* Fixed casing to be consistent */}
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/home" element={<App />} /> {/* Fixed from "component" to "element" */}
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/categories" element={<Category />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/mobilesearch" element={<MobileSearchPage />} />
        <Route path="/searchlist" element={<SearchList />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route
          path="/order-summary"
          element={
            <ProtectedRoute>
              <OrderSummaryPage />
            </ProtectedRoute>
          }
        />
        <Route path='mobilesearch' element={<MobileSearchPage />} />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/product/:id" element={
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        } />
        <Route path="admin/products/create" element={
          <ProtectedRoute>
            <AdminProductForm />
          </ProtectedRoute>
        } />

      </Routes>

    </BrowserRouter>
  </React.StrictMode>
);

