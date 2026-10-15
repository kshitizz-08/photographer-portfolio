import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import ErrorBoundary      from "./components/common/ErrorBoundary";
import { AuthProvider }   from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import ProtectedRoute     from "./components/admin/ProtectedRoute";
import AdminLayout        from "./components/admin/AdminLayout";
import Navbar      from "./components/layout/Navbar";
import Footer      from "./components/layout/Footer";
import Home        from "./pages/Home";
import Portfolio   from "./pages/Portfolio";
import Services    from "./pages/Services";
import About       from "./pages/About";
import Contact     from "./pages/Contact";
import NotFound    from "./pages/NotFound";
import Gallery     from "./pages/Gallery";

// Admin pages
import AdminLogin     from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPortfolio from "./pages/admin/AdminPortfolio";
import AdminGalleries from "./pages/admin/AdminGalleries";
import AdminServices  from "./pages/admin/AdminServices";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminSettings  from "./pages/admin/AdminSettings";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Public layout — with Navbar & Footer
function PublicLayout() {
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/"              element={<Home />}      />
        <Route path="/portfolio"     element={<Portfolio />}  />
        <Route path="/services"      element={<Services />}   />
        <Route path="/about"         element={<About />}      />
        <Route path="/contact"       element={<Contact />}    />
        <Route path="/gallery/:slug" element={<Gallery />}    />
        <Route path="/index.html"    element={<Navigate to="/" replace />} />
        <Route path="*"              element={<NotFound />}   />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ProfileProvider>
          <AuthProvider>
            <Routes>
              {/* Admin authentication */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected admin dashboard & studio management routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="portfolio" element={<AdminPortfolio />} />
                <Route path="galleries" element={<AdminGalleries />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Index fallback */}
              <Route path="/index.html" element={<Navigate to="/" replace />} />

              {/* Public website */}
              <Route path="/*" element={<PublicLayout />} />
            </Routes>
          </AuthProvider>
        </ProfileProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
