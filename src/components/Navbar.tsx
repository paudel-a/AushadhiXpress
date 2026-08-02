function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-10 py-5">
      {/* Logo */}
      <div>
        <h1 className="text-2xl font-bold text-green-700">AushadhiXpress</h1>
      </div>

      {/* Navigation */}
      <ul className="flex items-center gap-8 font-medium text-gray-700">
        <li>
          <a href="/" className="transition hover:text-green-600">
            Home
          </a>
        </li>

        <li>
          <a href="/" className="transition hover:text-green-600">
            Medicines
          </a>
        </li>

        <li>
          <a href="/" className="transition hover:text-green-600">
            Categories
          </a>
        </li>

        <li>
          <a href="/" className="transition hover:text-green-600">
            About
          </a>
        </li>
      </ul>

      {/* Button */}
      <button className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white transition hover:bg-green-700">
        Sign In
      </button>
    </nav>
  );
}

export default Navbar;
