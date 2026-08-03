import { Search, Pill, Truck, ShieldCheck } from "lucide-react";
import heroIllustration from "../../assets/images/hero-illustration.svg";
function Hero() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row">
        {/* Left Column */}
        <div className="w-full space-y-8 text-center lg:w-1/2 lg:text-left">
          <h1 className="text-5xl font-bold text-gray-900">
            Your Trusted Online Pharmacy
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-600 lg:mx-0">
            Order medicines online with secure prescription verification and
            fast home delivery across Nepal.
          </p>

          {/* Search Bar */}
          <div className="mx-auto flex max-w-2xl items-center overflow-hidden rounded-lg border border-gray-300 lg:mx-0">
            <Search size={20} className="ml-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search medicines..."
              className="flex-1 px-4 py-3 outline-none"
            />

            <button className="bg-green-600 px-6 py-3 text-white transition hover:bg-green-700">
              Search
            </button>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 lg:justify-start">
            <button className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700">
              Browse Medicines
            </button>

            <button className="rounded-lg border border-green-600 px-6 py-3 font-medium text-green-600 transition hover:bg-green-50">
              Upload Prescription
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-gray-600 lg:justify-start">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-600" />
              <p>Genuine Medicines</p>
            </div>

            <div className="flex items-center gap-2">
              <Pill size={18} className="text-green-600" />
              <p>Licensed Pharmacists</p>
            </div>

            <div className="flex items-center gap-2">
              <Truck size={18} className="text-green-600" />
              <p>Fast Home Delivery</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex w-full justify-center lg:w-1/2">
          <div className="relative flex h-[450px] w-[450px] items-center justify-center rounded-3xl bg-green-50">
            <div className="text-center">
              <img
                src={heroIllustration}
                alt="Online Pharmacy"
                className="h-80 w-auto"
              />

              <p className="mt-2 text-gray-600">
                Safe, Fast & Reliable Healthcare
              </p>
            </div>

            {/* Floating Card 1 */}
            <div className="absolute -left-6 top-12 rounded-xl bg-white p-4 shadow-lg">
              <p className="text-sm text-gray-500">Medicines</p>
              <h3 className="text-xl font-bold text-green-600">500+</h3>
            </div>

            {/* Floating Card 2 */}
            <div className="absolute -right-6 bottom-16 rounded-xl bg-white p-4 shadow-lg">
              <p className="text-sm text-gray-500">Delivery</p>
              <h3 className="text-xl font-bold text-green-600">24 Hours</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
