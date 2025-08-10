import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureTab } from "./FeatureTab";
import { features } from "@/config/features";
import heroImage from "@/assets/SecondImage.png";

export const FeaturesSection = () => {
  return (
    <section className="container px-4 py-24 bg-[#f9f7f2]">
      {/* Header Section */}
      <div className="max-w-2xl mb-20">
        <h2 className="text-5xl md:text-6xl font-normal mb-6 tracking-tight text-left text-[#1F376A]">
          Web3 Talent
          <br />
          <span className="text-gradient font-medium">Matching Features</span>
        </h2>
        <p className="text-lg md:text-xl text-[#333333] text-left">
          XmetX connects people to swap skills and services—no cash, no middlemen. 
          Every exchange is secured by smart contracts and backed by an on-chain 
          reputation you can trust.
        </p>
      </div>

      <Tabs defaultValue={features[0].title} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left side - Tab triggers */}
          <div className="md:col-span-5 space-y-3">
            <TabsList className="flex flex-col w-full bg-transparent h-auto p-0 space-y-3">
              {features.map((feature) => (
                <TabsTrigger
                  key={feature.title}
                  value={feature.title}
                  className="w-full data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                >
                  <FeatureTab
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    isActive={false}
                  />
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Right side - Fixed hero image */}
          <div className="md:col-span-7">
            <div className="relative w-full h-full min-h-[400px]">
              <img
                src={heroImage}
                alt="XmetX Decentralized Skill Exchange Dashboard"
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </Tabs>
    </section>
  );
};
