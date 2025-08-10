import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSpotlight } from "./CardSpotlight";

const PricingTier = ({
  name,
  price,
  description,
  features,
  isPopular,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}) => (
  <CardSpotlight className={`h-full ${isPopular ? "border-[#1F376A]" : "border-[#5C92C7]/20"} border-2`}>
    <div className="relative h-full p-6 flex flex-col">
      {isPopular && (
        <span className="text-xs font-medium bg-[#5C92C7]/10 text-[#1F376A] rounded-full px-3 py-1 w-fit mb-4">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-medium mb-2 text-[#1F376A]">{name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold text-[#1F376A]">{price}</span>
        {price !== "Custom" && <span className="text-[#3D6B9C]">/month</span>}
      </div>
      <p className="text-[#333333] mb-6">{description}</p>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="w-5 h-5 text-[#5C92C7]" />
            <span className="text-sm text-[#333333]">{feature}</span>
          </li>
        ))}
      </ul>
      <Button className="button-gradient w-full">
        Get Started
      </Button>
    </div>
  </CardSpotlight>
);

export const PricingSection = () => {
  return (
    <section className="container px-4 py-24 bg-[#f9f7f2]">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-normal mb-6 text-[#1F376A]"
        >
          Choose Your{" "}
          <span className="text-gradient font-medium">XMetX Plan</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-lg text-[#333333]"
        >
          Select the perfect plan to showcase your talent or find the right professionals
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PricingTier
          name="Talent Starter"
          price="$0"
          description="Perfect for professionals starting their Web3 career journey"
          features={[
            "Basic profile creation",
            "Project showcase (up to 3)",
            "Basic skill verification",
            "Email support",
            "Standard matching"
          ]}
        />
        <PricingTier
          name="Talent Pro"
          price="$19"
          description="Advanced features for serious professionals"
          features={[
            "Enhanced profile visibility",
            "Unlimited project showcase",
            "Advanced skill verification",
            "Priority matching algorithm",
            "Direct employer messaging",
            "Portfolio analytics"
          ]}
          isPopular
        />
        <PricingTier
          name="Enterprise"
          price="Custom"
          description="Comprehensive solutions for employers and organizations"
          features={[
            "Unlimited talent search",
            "Advanced filtering & matching",
            "Bulk hiring management",
            "Dedicated account manager",
            "Custom integration APIs",
            "24/7 priority support",
            "Team collaboration tools"
          ]}
        />
      </div>
    </section>
  );
};
