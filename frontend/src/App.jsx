import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import ErrorBoundary      from "./components/common/ErrorBoundary";
import { AuthProvider }   from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import Navbar      from "./components/layout/Navbar";
import Footer      from "./components/layout/Footer";
// Home is above-the-fold — keep eagerly loaded for instant first paint
import Home        from "./pages/Home";

// Public pages — lazy-loaded so they don't block initial bundle
const Portfolio   = lazy(() => import("./pages/Portfolio"));
const Services    = lazy(() => import("./pages/Services"));
const About       = lazy(() => import("./pages/About"));
const Contact     = lazy(() => import("./pages/Contact"));
const NotFound    = lazy(() => import("./pages/NotFound"));
const Gallery     = lazy(() => import("./pages/Gallery"));

// Admin pages — lazy-loaded so they are never downloaded by public visitors
const ProtectedRoute  = lazy(() => import("./components/admin/ProtectedRoute"));
const AdminLayout     = lazy(() => import("./components/admin/AdminLayout"));
const AdminLogin      = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard  = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPortfolio  = lazy(() => import("./pages/admin/AdminPortfolio"));
const AdminGalleries  = lazy(() => import("./pages/admin/AdminGalleries"));
const AdminServices   = lazy(() => import("./pages/admin/AdminServices"));
const AdminInquiries  = lazy(() => import("./pages/admin/AdminInquiries"));
const AdminSettings   = lazy(() => import("./pages/admin/AdminSettings"));

/** Minimal page-transition fallback — avoids layout shift */
function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: "2px solid #E0DDD8",
          borderTopColor: "#C4A882",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
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
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </AuthProvider>
        </ProfileProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

