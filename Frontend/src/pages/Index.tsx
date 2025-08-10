import { motion } from "framer-motion";
import { ArrowRight, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom"; // 🔧 ADD: Import useNavigate
import Navigation from "@/components/Navigation";
import { FeaturesSection } from "@/components/features/FeaturesSection";
import { PricingSection } from "@/components/pricing/PricingSection";
import LogoCarousel from "@/components/LogoCarousel";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import heroImage from "@/assets/HeroSection.png";

const Index = () => {
  const navigate = useNavigate(); // 🔧 ADD: useNavigate hook

  // 🔧 ADD: Navigation handler function
  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-[#f9f7f2] text-foreground">
      <Navigation />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative container px-4 pt-40 pb-20 bg-[#f9f7f2]"
      >
        <div className="absolute inset-0 -z-10 bg-[#f9f7f2]" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full glass"
        >
          <span className="text-sm font-medium flex items-center gap-2">
            <Command className="w-4 h-4" />
            Swap services. No cash. Full trust.
          </span>
        </motion.div>

        <div className="max-w-4xl relative z-10">
          <h1 className="text-5xl md:text-7xl font-normal mb-4 tracking-tight text-left">
            <span className="text-[#333333]">
              <TextGenerateEffect words="Rebooting Barter" />
            </span>
            <br />
            <span className="text-[#1F376A] font-medium">
              <TextGenerateEffect words="for the Web3 Era" />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-[#333333] mb-8 max-w-2xl text-left"
          >
            XmetX is a decentralized skill exchange platform where you trade your talent for someone else's—secured by smart contracts and powered by on-chain reputation.{" "}
            <span className="text-[#1F376A]">No middlemen. No platform cuts. Just pure collaboration.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 items-start"
          >
            {/* 🔧 FIXED: Added onClick handler to Get Started button */}
            <Button
              size="lg"
              className="button-gradient"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative mx-auto max-w-5xl mt-20"
        >
          <div className="glass rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <img
              src={heroImage}
              alt="XMetX Web3 Talent Platform Dashboard"
              className="w-full h-auto"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Other Sections */}
      <div className="bg-[#f9f7f2]">
        <LogoCarousel />
      </div>

      <div id="features" className="bg-[#f9f7f2]">
        <FeaturesSection />
      </div>

      <div id="pricing" className="bg-[#f9f7f2]">
        <PricingSection />
      </div>

      <div className="bg-[#f9f7f2]">
        <TestimonialsSection />
      </div>
      <section className="container px-4 py-20 relative bg-[#f9f7f2]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("/lovable-uploads/21f3edfb-62b5-4e35-9d03-7339d803b980.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#f9f7f2]/90 backdrop-blur-lg border border-[#5C92C7]/20 rounded-2xl p-8 md:p-12 text-center relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1F376A]">
            Ready to revolutionize hiring?
          </h2>
          <p className="text-lg text-[#333333] mb-8 max-w-2xl mx-auto">
            Join XMetX and discover how Web3 technology creates perfect matches between talent and opportunity.
          </p>
          <Button size="lg" className="button-gradient">
            Create Profile
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      <div className="bg-[#f9f7f2]">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
