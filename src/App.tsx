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
import Profile from "./pages/Profile";
import CategoriesPage from "./pages/CategoriesPage";
import MedicinesAdminPage from "./pages/admin/MedicinesAdminPage";
import MedicinePage from "./pages/MedicinePage";
import CartIcon from "./components/CartIcon";
import { CartProvider } from "./context/CartContext";
import CartPage from "./pages/CartPage";

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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/admin/medicines" element={<MedicinesAdminPage />} />
          <Route path="/medicines" element={<MedicinePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
