import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Hero from "./components/home/Hero";
import Categories from "./components/home/Categories";
import FeaturedMedicines from "./components/home/FeaturedMedicines";
import Benefits from "./components/home/Benefits";
import PrescriptionCTA from "./components/home/PrescriptionCTA";
import Footer from "./components/layout/Footer";

import Login from "./pages/login";
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";

import Profile from "./pages/Profile";
import CategoriesPage from "./pages/CategoriesPage";
import MedicinePage from "./pages/MedicinePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import Prescriptions from "./pages/Prescriptions";

import MedicinesAdminPage from "./pages/admin/MedicinesAdminPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminRoute from "./components/auth/AdminRoute";
import AdminOrdersPage from "./components/admin/AdminOrdersPage";

import PharmacistPrescriptions from "./pages/PharmacistPrescriptions";
import PharmacistLayout from "./pages/pharmacist/PharmacistLayout";

import { CartProvider } from "./context/CartContext";

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <FeaturedMedicines />
        <Benefits />
        <PrescriptionCTA />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/medicines" element={<MedicinePage />} />

          {/* Authenticated routes */}
          <Route element={<ProtectedRoute />}>
            {/* Customer-only pages */}
            <Route element={<RoleRoute allowedRoles={["CUSTOMER"]} />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route
                path="/order-confirmation"
                element={<OrderConfirmationPage />}
              />
            </Route>

            {/* Pharmacist dashboard */}
            <Route element={<RoleRoute allowedRoles={["PHARMACIST"]} />}>
              <Route path="/pharmacist" element={<PharmacistLayout />}>
                <Route
                  path="prescriptions"
                  element={<PharmacistPrescriptions />}
                />
              </Route>
            </Route>

            {/* Admin dashboard */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route
                  path="/admin/medicines"
                  element={<MedicinesAdminPage />}
                />
                <Route
                  path="/admin/prescriptions"
                  element={<PharmacistPrescriptions />}
                />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
