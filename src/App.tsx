import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingPhone from "@/components/FloatingPhone";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";

const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));

const ContactsPage = lazy(() => import("./pages/ContactsPage"));
const RequestPage = lazy(() => import("./pages/RequestPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const ReclamationPage = lazy(() => import("./pages/ReclamationPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Dashboard pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminRequests = lazy(() => import("./pages/admin/AdminRequests"));
const AdminAccounts = lazy(() => import("./pages/admin/AdminAccounts"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));
const AdminEstimates = lazy(() => import("./pages/admin/AdminEstimates"));
const ManagerDashboard = lazy(() => import("./pages/manager/ManagerDashboard"));
const ManagerAssign = lazy(() => import("./pages/manager/ManagerAssign"));
const ManagerFiles = lazy(() => import("./pages/manager/ManagerFiles"));
const ManagerEstimates = lazy(() => import("./pages/manager/ManagerEstimates"));
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
  const isDashboard = ["/admin", "/manager", "/measurer", "/installer", "/partner", "/login"].some(
    (p) => location.pathname.startsWith(p)
  );
  
  return (
    <>
      <ScrollToTop />
      {!isDashboard && <Header />}
      {children}
      {!isDashboard && <Footer />}
      {!isDashboard && <FloatingPhone />}
    </>
  );
};

const SuspenseFallback = () => {
  const location = useLocation();
  const isDashboard = ["/admin", "/manager", "/measurer", "/installer", "/partner"].some(
    (p) => location.pathname.startsWith(p)
  );
  return <div className={`min-h-screen ${isDashboard ? "dashboard-theme bg-[hsl(220,20%,97%)]" : ""}`} />;
};

const AppRoutes = () => (
  <Layout>
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<ArticlePage />} />
        <Route path="/reclamation" element={<ReclamationPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRequests /></ProtectedRoute>} />
        <Route path="/admin/accounts" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAccounts /></ProtectedRoute>} />
        <Route path="/admin/news" element={<ProtectedRoute allowedRoles={["admin"]}><AdminNews /></ProtectedRoute>} />
        <Route path="/admin/estimates" element={<ProtectedRoute allowedRoles={["admin"]}><AdminEstimates /></ProtectedRoute>} />
        {/* Manager */}
        <Route path="/manager" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/manager/assign" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerAssign /></ProtectedRoute>} />
        <Route path="/manager/files" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerFiles /></ProtectedRoute>} />
        <Route path="/manager/estimates" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerEstimates /></ProtectedRoute>} />
        {/* Measurer */}
        <Route path="/measurer" element={<ProtectedRoute allowedRoles={["measurer"]}><MeasurerDashboard /></ProtectedRoute>} />
        <Route path="/measurer/history" element={<ProtectedRoute allowedRoles={["measurer"]}><MeasurerHistory /></ProtectedRoute>} />
        <Route path="/measurer/estimates" element={<ProtectedRoute allowedRoles={["measurer"]}><MeasurerEstimates /></ProtectedRoute>} />
        {/* Installer */}
        <Route path="/installer" element={<ProtectedRoute allowedRoles={["installer"]}><InstallerDashboard /></ProtectedRoute>} />
        <Route path="/installer/history" element={<ProtectedRoute allowedRoles={["installer"]}><InstallerHistory /></ProtectedRoute>} />
        <Route path="/installer/estimates" element={<ProtectedRoute allowedRoles={["installer"]}><InstallerEstimates /></ProtectedRoute>} />
        {/* Partner */}
        <Route path="/partner" element={<ProtectedRoute allowedRoles={["partner"]}><PartnerDashboard /></ProtectedRoute>} />
        <Route path="/partner/new" element={<ProtectedRoute allowedRoles={["partner"]}><PartnerNewRequest /></ProtectedRoute>} />
        <Route path="/partner/history" element={<ProtectedRoute allowedRoles={["partner"]}><PartnerHistory /></ProtectedRoute>} />
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
