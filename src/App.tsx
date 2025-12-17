import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import { applyTheme } from "./utils/settings";

// Lazy-loaded page components for better performance
const Home = lazy(() => import("./pages/Home"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const OurWork = lazy(() => import("./pages/OurWork"));
const GetInvolved = lazy(() => import("./pages/GetInvolved"));
const Partners = lazy(() => import("./pages/Partners"));
const Contact = lazy(() => import("./pages/Contact"));
const Donate = lazy(() => import("./pages/Donate"));
const DonationCallback = lazy(() => import("./pages/DonationCallback"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const AreasOfIntervention = lazy(() => import("./pages/AreasOfIntervention"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Actualites = lazy(() => import("./pages/Actualites"));

// Redirect components for old routes
const ProjectRedirect = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/projet/${id}`} replace />;
};

const NewsRedirect = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/actualite/${id}`} replace />;
};

const JobRedirect = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/opportunite/${id}`} replace />;
};

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
    // Theme is now fixed to blue; ensure CSS variables are set
    applyTheme('blue');
    
    const handleSettingsUpdate = () => {
      // Even if a theme were stored, we always enforce blue
      applyTheme('blue');
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
        <Suspense
          fallback={
            <div style={{ padding: "4rem 0", textAlign: "center", color: "var(--text-secondary, #616161)" }}>
              Chargement...
            </div>
          }
        >
        <Routes>
          <Route path="/" element={<Home />} />
            <Route path="/a-propos" element={<AboutUs />} />
            <Route path="/nos-projets" element={<OurWork />} />
            <Route path="/projet/:id" element={<ProjectDetail />} />
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/actualite/:id" element={<ProjectDetail />} />
            {/* Backwards compatibility: redirect old paths */}
            <Route path="/project/:id" element={<ProjectRedirect />} />
            <Route path="/news/:id" element={<NewsRedirect />} />
            <Route path="/s-engager" element={<GetInvolved />} />
            <Route path="/getinvolved" element={<Navigate to="/s-engager" replace />} />
            <Route path="/opportunite/:id" element={<JobDetail />} />
            {/* Backwards compatibility: redirect old path */}
            <Route path="/job/:id" element={<JobRedirect />} />
            <Route path="/domaines-d-intervention" element={<AreasOfIntervention />} />
            <Route path="/partenaires" element={<Partners />} />
          <Route path="/contact" element={<Contact />} />
            <Route path="/faire-un-don" element={<Donate />} />
            <Route path="/don/retour" element={<DonationCallback />} />
            {/* Backwards compatibility: redirect old path */}
            <Route path="/donation/callback" element={<Navigate to="/don/retour" replace />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
        </Routes>
        </Suspense>
      </div>

      {/* Shared Footer - not shown on admin routes */}
      {!isAdminRoute && <Footer />}
      {/* Cookie banner for public routes */}
      {!isAdminRoute && <CookieBanner />}
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
