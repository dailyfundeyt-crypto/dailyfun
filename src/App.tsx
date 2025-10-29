import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GradientProvider } from "./contexts/GradientContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
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
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import Community from "./pages/Community";
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
        <ThemeProvider>
          <GradientProvider>
            <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar />
              <div className="flex flex-col flex-1 w-full">
                <Header />
                <main className="flex-1 pb-16 md:pb-0">
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
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/community" element={<Community />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <MobileBottomNav />
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
            </TooltipProvider>
          </GradientProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
