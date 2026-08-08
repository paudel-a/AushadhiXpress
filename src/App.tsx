import Navbar from "./components/layout/Navbar";
import Hero from "./components/home/Hero";
import Categories from "./components/home/Categories";
import FeaturedMedicines from "./components/home/FeaturedMedicines";
import Benefits from "./components/home/Benefits";
import PrescriptionCTA from "./components/home/PrescriptionCTA";
import Footer from "./components/layout/Footer";
function App() {
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

export default App;
