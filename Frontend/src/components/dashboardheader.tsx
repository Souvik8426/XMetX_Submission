import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, User } from "firebase/auth";
import { auth } from "@/components/firebase/firebase";
import { 
  LogOut, 
  Bell,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from '../../public/XMetX_Logo.png';

interface DashboardHeaderProps {
  user: User | null;
}

const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const dashboardNavItems = [
    { name: "Dashboard", onClick: () => navigate('/dashboard') },
  ];

  return (
    <header className="fixed top-3.5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 rounded-full h-14 bg-[#f5f3ee]/80 border border-[#5C92C7]/20 w-[95%] max-w-6xl shadow-md backdrop-blur-sm">
      <div className="mx-auto h-full px-6">
        <nav className="flex items-center justify-between h-full">
          {/* Logo + Text - Navigate to Matches */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/matches')}
          >
            <img 
              src={logo}
              alt="XMetX Logo" 
              className="w-6 h-6 object-contain transition-opacity duration-300 opacity-100"
            />
            <span className="font-bold text-base text-[#1F376A]">
              XMetX
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {dashboardNavItems.map((item) => (
              <button
                key={item.name}
                onClick={item.onClick}
                className="text-sm transition-all duration-300 font-medium text-[#3D6B9C] hover:text-[#1F376A]"
              >
                {item.name}
              </button>
            ))}
            
            {/* Desktop User Actions - Removed Settings Icon */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-[#3D6B9C] hover:bg-[#5C92C7]/10 h-8 w-8">
                <Bell className="w-4 h-4" />
              </Button>
              <Avatar className="h-7 w-7 border-2 border-[#5C92C7]/30">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="bg-[#5C92C7] text-white text-xs">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                onClick={handleLogout}
                size="sm"
                className="text-[#3D6B9C] hover:text-[#1F376A] hover:bg-[#5C92C7]/10 text-xs"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="glass transition-all duration-300 border-[#5C92C7]/30 hover:border-[#3D6B9C]/50"
                >
                  <Menu className="h-5 w-5 text-[#3D6B9C]" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#f9f7f2] border-l border-[#5C92C7]/20">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <img 
                      src={logo}
                      alt="XMetX Logo" 
                      className="w-7 h-7 object-contain"
                    />
                    <span className="font-bold text-lg text-[#1F376A]">XMetX</span>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-[#5C92C7]/10 rounded-lg">
                    <Avatar className="h-10 w-10 border-2 border-[#5C92C7]/30">
                      <AvatarImage src={user?.photoURL || ''} />
                      <AvatarFallback className="bg-[#5C92C7] text-white text-sm">
                        {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-[#1F376A]">
                        {user?.displayName || 'Developer'}
                      </p>
                      <p className="text-sm text-[#3D6B9C]">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {dashboardNavItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        item.onClick();
                      }}
                      className="text-lg text-[#3D6B9C] hover:text-[#1F376A] transition-colors font-medium text-left"
                    >
                      {item.name}
                    </button>
                  ))}
                  
                  {/* Mobile Action Buttons - Removed Settings Icon */}
                  <div className="flex gap-2 mt-4">
                    <Button variant="ghost" size="icon" className="text-[#3D6B9C] hover:bg-[#5C92C7]/10">
                      <Bell className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="button-gradient mt-4"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default DashboardHeader;
