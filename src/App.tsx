import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { getSettings, applyTheme } from "./utils/settings";

// Import your page components
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import OurWork from "./pages/OurWork";
import GetInvolved from "./pages/GetInvolved";
import Partners from "./pages/Partners";
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";
import DonationCallback from "./pages/DonationCallback";
import ProjectDetail from "./pages/ProjectDetail";
import JobDetail from "./pages/JobDetail";
import AreasOfIntervention from "./pages/AreasOfIntervention";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";

// Global Styles
import "./App.css";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  // Initialize theme on app load and listen for changes
  useEffect(() => {
    const settings = getSettings();
    applyTheme(settings.theme || 'orange');
    
    const handleSettingsUpdate = () => {
      const updatedSettings = getSettings();
      applyTheme(updatedSettings.theme || 'orange');
    };
    
    window.addEventListener('imadel:settings:updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('imadel:settings:updated', handleSettingsUpdate);
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      {/* Shared Header - not shown on admin routes */}
      {!isAdminRoute && <Header />}

      {/* Page Content */}
      <div style={{ marginTop: isAdminRoute || isHomePage ? "0" : "100px", flex: "1 0 auto" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/ourwork" element={<OurWork />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/news/:id" element={<ProjectDetail />} />
          <Route path="/getinvolved" element={<GetInvolved />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/areas" element={<AreasOfIntervention />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/donation/callback" element={<DonationCallback />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
        </Routes>
      </div>

      {/* Shared Footer - not shown on admin routes */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
