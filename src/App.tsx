import React, { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Header from "@/components/Header";
import DashboardErrorBoundary from "@/components/DashboardErrorBoundary";
import Footer from "@/components/Footer";
import FloatingPhone from "@/components/FloatingPhone";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import CookieBanner from "@/components/CookieBanner";
import Index from "./pages/Index";

const ServicesPage = lazy(() => import("./pages/ServicesPage"));


const ContactsPage = lazy(() => import("./pages/ContactsPage"));
const RequestPage = lazy(() => import("./pages/RequestPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const ReclamationPage = lazy(() => import("./pages/ReclamationPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const PartnerInfoPage = lazy(() => import("./pages/PartnerPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Dashboard pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminRequests = lazy(() => import("./pages/admin/AdminRequests"));
const AdminAccounts = lazy(() => import("./pages/admin/AdminAccounts"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));
const AdminEstimates = lazy(() => import("./pages/admin/AdminEstimates"));
const AdminCalendar = lazy(() => import("./pages/admin/AdminCalendar"));
const ManagerDashboard = lazy(() => import("./pages/manager/ManagerDashboard"));
const ManagerAssign = lazy(() => import("./pages/manager/ManagerAssign"));
const ManagerFiles = lazy(() => import("./pages/manager/ManagerFiles"));
const ManagerEstimates = lazy(() => import("./pages/manager/ManagerEstimates"));
const ManagerCalendar = lazy(() => import("./pages/manager/ManagerCalendar"));
const MeasurerDashboard = lazy(() => import("./pages/measurer/MeasurerDashboard"));
const MeasurerHistory = lazy(() => import("./pages/measurer/MeasurerHistory"));
const MeasurerEstimates = lazy(() => import("./pages/measurer/MeasurerEstimates"));
const InstallerDashboard = lazy(() => import("./pages/installer/InstallerDashboard"));
const InstallerHistory = lazy(() => import("./pages/installer/InstallerHistory"));
const InstallerEstimates = lazy(() => import("./pages/installer/InstallerEstimates"));
const PartnerDashboard = lazy(() => import("./pages/partner/PartnerDashboard"));
const PartnerNewRequest = lazy(() => import("./pages/partner/PartnerNewRequest"));
const PartnerHistory = lazy(() => import("./pages/partner/PartnerHistory"));

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isDashboard = ["/admin", "/manager", "/measurer", "/installer", "/partner", "/login", "/register"].some(
    (p) => location.pathname.startsWith(p)
  );

  // Sync body background with dashboard/site theme to prevent black flash
  useEffect(() => {
    if (isDashboard) {
      document.body.style.backgroundColor = "hsl(220, 25%, 97%)";
    } else {
      document.body.style.backgroundColor = "";
    }
    return () => { document.body.style.backgroundColor = ""; };
  }, [isDashboard]);
  
  return (
    <>
      <ScrollToTop />
      {!isDashboard && <Header />}
      {children}
      {!isDashboard && <Footer />}
      {!isDashboard && <FloatingPhone />}
      {!isDashboard && <CookieBanner />}
    </>
  );
};

const SuspenseFallback = () => {
  const location = useLocation();
  const isDashboard = ["/admin", "/manager", "/measurer", "/installer", "/partner", "/login", "/register"].some(
    (p) => location.pathname.startsWith(p)
  );
  return (
    <div
      className={`fixed inset-0 z-50 ${isDashboard ? "bg-[hsl(220,25%,97%)]" : "bg-background"}`}
      style={{ minHeight: "100vh" }}
    />
  );
};

const AppRoutes = () => (
  <Layout>
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/services" element={<ServicesPage />} />
        
        
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<ArticlePage />} />
        <Route path="/reclamation" element={<ReclamationPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/become-partner" element={<PartnerInfoPage />} />
        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardErrorBoundary><AdminDashboard /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardErrorBoundary><AdminRequests /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/accounts" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardErrorBoundary><AdminAccounts /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/news" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardErrorBoundary><AdminNews /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/estimates" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardErrorBoundary><AdminEstimates /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardErrorBoundary><AdminCalendar /></DashboardErrorBoundary></ProtectedRoute>} />
        {/* Manager */}
        <Route path="/manager" element={<ProtectedRoute allowedRoles={["manager"]}><DashboardErrorBoundary><ManagerDashboard /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/manager/assign" element={<ProtectedRoute allowedRoles={["manager"]}><DashboardErrorBoundary><ManagerAssign /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/manager/files" element={<ProtectedRoute allowedRoles={["manager"]}><DashboardErrorBoundary><ManagerFiles /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/manager/estimates" element={<ProtectedRoute allowedRoles={["manager"]}><DashboardErrorBoundary><ManagerEstimates /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/manager/calendar" element={<ProtectedRoute allowedRoles={["manager"]}><DashboardErrorBoundary><ManagerCalendar /></DashboardErrorBoundary></ProtectedRoute>} />
        {/* Measurer */}
        <Route path="/measurer" element={<ProtectedRoute allowedRoles={["measurer"]}><DashboardErrorBoundary><MeasurerDashboard /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/measurer/history" element={<ProtectedRoute allowedRoles={["measurer"]}><DashboardErrorBoundary><MeasurerHistory /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/measurer/estimates" element={<ProtectedRoute allowedRoles={["measurer"]}><DashboardErrorBoundary><MeasurerEstimates /></DashboardErrorBoundary></ProtectedRoute>} />
        {/* Installer */}
        <Route path="/installer" element={<ProtectedRoute allowedRoles={["installer"]}><DashboardErrorBoundary><InstallerDashboard /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/installer/history" element={<ProtectedRoute allowedRoles={["installer"]}><DashboardErrorBoundary><InstallerHistory /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/installer/estimates" element={<ProtectedRoute allowedRoles={["installer"]}><DashboardErrorBoundary><InstallerEstimates /></DashboardErrorBoundary></ProtectedRoute>} />
        {/* Partner */}
        <Route path="/partner" element={<ProtectedRoute allowedRoles={["partner"]}><DashboardErrorBoundary><PartnerDashboard /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/partner/new" element={<ProtectedRoute allowedRoles={["partner"]}><DashboardErrorBoundary><PartnerNewRequest /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="/partner/history" element={<ProtectedRoute allowedRoles={["partner"]}><DashboardErrorBoundary><PartnerHistory /></DashboardErrorBoundary></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </Layout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
