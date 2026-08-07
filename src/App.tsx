import Navbar from "./components/layout/Navbar";
import Hero from "./components/home/Hero";
import Categories from "./components/home/Categories";
import FeaturedMedicines from "./components/home/FeaturedMedicines";
function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedMedicines />
    </>
  );
}

export default App;
