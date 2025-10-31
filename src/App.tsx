import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Import your page components
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import OurWork from "./pages/OurWork";
import GetInvolved from "./pages/GetInvolved";
import Partners from "./pages/Partners";
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";

// Global Styles
import "./App.css";

function App() {
  return (
    <Router>
      {/* Shared Header */}
      <Header />

      {/* Page Content */}
      <div style={{ marginTop: "100px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/ourwork" element={<OurWork />} />
          <Route path="/getinvolved" element={<GetInvolved />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
        </Routes>
      </div>

      {/* Shared Footer */}
      <Footer />
    </Router>
  );
}

export default App;
