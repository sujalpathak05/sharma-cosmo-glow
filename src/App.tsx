import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { sectionPaths, sectionRoutes } from "@/lib/siteRoutes";
import Index from "./pages/Index.tsx";

const Admin = lazy(() => import("./pages/Admin.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AppointmentPage = lazy(() => import("./pages/AppointmentPage.tsx"));
const BlogDetail = lazy(() => import("./pages/BlogDetail.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const routeFallback = <div className="min-h-screen bg-background" />;
const homeSectionPaths = sectionPaths.filter((path) => path !== sectionRoutes.appointment);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={routeFallback}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path={sectionRoutes.appointment} element={<AppointmentPage />} />
              {homeSectionPaths.map((path) => (
                <Route key={path} path={path} element={<Index />} />
              ))}
              <Route path="/blogs/:slug" element={<BlogDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
