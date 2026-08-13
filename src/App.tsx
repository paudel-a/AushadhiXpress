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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
