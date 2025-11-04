import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Lazy load page components for code splitting
const Home = lazy(() => import("./pages/Home"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const OurWork = lazy(() => import("./pages/OurWork"));
const GetInvolved = lazy(() => import("./pages/GetInvolved"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Partners = lazy(() => import("./pages/Partners"));
const Contact = lazy(() => import("./pages/Contact"));
const Donate = lazy(() => import("./pages/Donate"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '1.1rem',
    color: '#FF6B00'
  }}>
    Loading...
  </div>
);

// Global Styles
import "./App.css";

function App() {
  return (
    <Router>
      {/* Shared Header */}
      <Header />

      {/* Page Content */}
      <div style={{ marginTop: "100px" }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/ourwork" element={<OurWork />} />
            <Route path="/getinvolved" element={<GetInvolved />} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </Suspense>
      </div>

      {/* Shared Footer */}
      <Footer />
    </Router>
  );
}

export default App;
