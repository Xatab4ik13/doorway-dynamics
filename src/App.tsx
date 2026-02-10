import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import ServicesPage from "./pages/ServicesPage";
import InteriorDoorsPage from "./pages/InteriorDoorsPage";
import EntranceDoorsPage from "./pages/EntranceDoorsPage";
import LocksPage from "./pages/LocksPage";
import AdjustmentPage from "./pages/AdjustmentPage";
import DemolitionPage from "./pages/DemolitionPage";
import PortfolioPage from "./pages/PortfolioPage";
import ReviewsPage from "./pages/ReviewsPage";
import ContactsPage from "./pages/ContactsPage";
import RequestPage from "./pages/RequestPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  
  return (
    <>
      <ScrollToTop />
      {!isLoginPage && <Header />}
      {children}
      {!isLoginPage && <Footer />}
    </>
  );
};

const AppRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/interior" element={<InteriorDoorsPage />} />
      <Route path="/services/entrance" element={<EntranceDoorsPage />} />
      <Route path="/services/locks" element={<LocksPage />} />
      <Route path="/services/adjustment" element={<AdjustmentPage />} />
      <Route path="/services/demolition" element={<DemolitionPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/request" element={<RequestPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Layout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
