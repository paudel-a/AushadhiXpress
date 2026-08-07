import Navbar from "./components/layout/Navbar";
import Hero from "./components/home/Hero";
import Categories from "./components/home/Categories";
import FeaturedMedicines from "./components/home/FeaturedMedicines";
import Benefits from "./components/home/Benefits";
function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedMedicines />
      <Benefits />
    </>
  );
}

export default App;
