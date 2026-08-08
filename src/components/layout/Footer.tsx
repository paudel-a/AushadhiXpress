import { Mail, Phone, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-slate-900 px-6 py-14 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white">AushadhiXpress</h2>

          <p className="mt-4 max-w-sm text-sm leading-6">
            Your trusted online pharmacy for genuine medicines, secure
            prescription verification, and convenient home delivery across
            Nepal.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-white">Quick Links</h3>

          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href="#" className="transition hover:text-white">
                Home
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-white">
                Medicines
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-white">
                Categories
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-white">
                Upload Prescription
              </a>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="font-semibold text-white">Customer Service</h3>

          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href="#" className="transition hover:text-white">
                Contact Us
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-white">
                Delivery Information
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-white">
                Privacy Policy
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-white">
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-white">Contact Us</h3>

          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Phone size={18} />
              <span>+977 9876543210</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={18} />
              <span>support@aushadhixpress.com</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={18} />
              <span>Kathmandu, Nepal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto mt-12 max-w-7xl border-t border-slate-700 pt-6 text-center text-sm">
        © {new Date().getFullYear()} AushadhiXpress. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
