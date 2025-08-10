import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useNavigate } from "react-router-dom";
import logo from '../../public/XMetX_Logo.png';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'testimonials') {
      const testimonialSection = document.querySelector('.animate-marquee');
      if (testimonialSection) {
        const yOffset = -100;
        const y = testimonialSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else if (sectionId === 'cta') {
      const ctaSection = document.querySelector('.button-gradient');
      if (ctaSection) {
        const yOffset = -100;
        const y = ctaSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const navItems = [
    { name: "Features", href: "#features", onClick: () => scrollToSection('features') },
    { name: "Pricing", href: "#pricing", onClick: () => scrollToSection('pricing') },
    { name: "Testimonials", href: "#testimonials", onClick: () => scrollToSection('testimonials') },
  ];

  return (
    <header
      className={`fixed top-3.5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 rounded-full ${
        isScrolled 
          ? "h-14 bg-black/60 backdrop-blur-xl border border-white/10 scale-95 w-[90%] max-w-2xl shadow-lg" 
          : "h-14 bg-[#f5f3ee]/80 border border-[#5C92C7]/20 w-[95%] max-w-3xl shadow-md backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto h-full px-6">
        <nav className="flex items-center justify-between h-full">
          {/* Logo + Text */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img 
              src={logo}
              alt="XMetX Logo" 
              className={`w-6 h-6 object-contain transition-opacity duration-300 ${
                isScrolled ? 'opacity-90' : 'opacity-100'
              }`}
            />
            <span 
              className={`font-bold text-base ${
                isScrolled ? 'text-white' : 'text-[#1F376A]'
              }`}
            >
              XMetX
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.onClick) {
                    item.onClick();
                  }
                }}
                className={`text-sm transition-all duration-300 font-medium ${
                  isScrolled 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-[#3D6B9C] hover:text-[#1F376A]'
                }`}
              >
                {item.name}
              </a>
            ))}
            <Button 
              onClick={handleGetStarted}
              size="sm"
              className="button-gradient"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`glass transition-all duration-300 ${
                    isScrolled 
                      ? 'border-white/20 hover:border-white/40' 
                      : 'border-[#5C92C7]/30 hover:border-[#3D6B9C]/50'
                  }`}
                >
                  <Menu className={`h-5 w-5 ${isScrolled ? 'text-gray-300' : 'text-[#3D6B9C]'}`} />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#f9f7f2] border-l border-[#5C92C7]/20">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <img 
                      src="/your-logo.png" 
                      alt="XMetX Logo" 
                      className="w-7 h-7 object-contain"
                    />
                    <span className="font-bold text-lg text-[#1F376A]">XMetX</span>
                  </div>
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-lg text-[#3D6B9C] hover:text-[#1F376A] transition-colors font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        if (item.onClick) {
                          item.onClick();
                        }
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
                  <Button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleGetStarted();
                    }}
                    className="button-gradient mt-4"
                  >
                    Get Started
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

export default Navigation;
