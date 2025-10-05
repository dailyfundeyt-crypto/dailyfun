
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import MobileBottomNav from "./components/MobileBottomNav";
import Search from "./pages/Search";
import Article from "./pages/Article";
import AboutUs from "./pages/AboutUs";
import Products from "./pages/Products";
import CategoryPage from "./pages/CategoryPage";
import ProfileManagement from "./pages/ProfileManagement";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import SocialMedia from "./pages/SocialMedia";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AI from "./pages/AI";
import Auth from "./pages/Auth";
import CreateArticle from "./pages/CreateArticle";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle scroll restoration
const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  useEffect(() => {
    const shouldRestore = (location.state as any)?.restoreScroll;
    if (navigationType === 'PUSH' && !shouldRestore) {
      window.scrollTo(0, 0);
    }
  }, [location, navigationType]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-background">
            <Header />
            <main className="pb-16 md:pb-0">
              <Routes>
                <Route path="/" element={<Search />} />
                <Route path="/search" element={<Search />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/products" element={<Products />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/social-media" element={<SocialMedia />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/ai" element={<AI />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/article/:id" element={<Article />} />
                <Route path="/weird" element={<ProfileManagement />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/create-article" element={<CreateArticle />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <MobileBottomNav />
          </div>
        </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
