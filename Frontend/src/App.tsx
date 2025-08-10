import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/dashboard";
import ProfileForm from "./components/profileform";
import Matches from "./pages/Matches";
import SearchResults from "./pages/SearchResults";
import UserPage from "./pages/UserPage";
import CollaborationPage from "./pages/CollaborationPage"; // 🔧 ADD: Import CollaborationPage

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen xmetx-bg">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile-form" element={<ProfileForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/results" element={<SearchResults />} />
            <Route path="/user/:userId" element={<UserPage />} />
            <Route path="/collaborate/:userId" element={<CollaborationPage />} /> {/* 🔧 ADD: New route */}
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
