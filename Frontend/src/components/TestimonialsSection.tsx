"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";

const testimonials = [
  {
    name: "Alex Thompson",
    role: "Full Stack Developer",
    image: "https://avatars.githubusercontent.com/u/1234567?v=4",
    content: "XMetX revolutionized how I present my skills to potential employers. The Web3 integration and smart matching connected me with my dream job in just two weeks."
  },
  {
    name: "Maria Rodriguez",
    role: "Blockchain Developer",
    image: "https://avatars.githubusercontent.com/u/2345678?v=4",
    content: "As a hiring manager, XMetX's intelligent matching algorithm saves us countless hours. We find exactly the talent we need with verified skills and proven project portfolios."
  },
  {
    name: "David Chen",
    role: "UI/UX Designer",
    image: "https://avatars.githubusercontent.com/u/3456789?v=4",
    content: "The platform's Web3 approach to professional networking is game-changing. My portfolio gets genuine visibility, and employers can verify my skills through blockchain technology."
  },
  {
    name: "Jennifer Wu",
    role: "Product Manager",
    image: "https://avatars.githubusercontent.com/u/4567890?v=4",
    content: "XMetX helped us build our entire development team efficiently. The quality of candidates and the seamless matching process exceeded our expectations completely."
  },
  {
    name: "Robert Singh",
    role: "DevOps Engineer",
    image: "https://avatars.githubusercontent.com/u/5678901?v=4",
    content: "The decentralized approach to talent acquisition gives me control over my professional data. XMetX connects me with opportunities that truly match my expertise."
  },
  {
    name: "Emma Johnson",
    role: "Tech Recruiter",
    image: "https://avatars.githubusercontent.com/u/6789012?v=4",
    content: "XMetX streamlined our entire hiring process. The verified portfolios and skill assessments help us make confident decisions faster than ever before."
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 overflow-hidden bg-[#f9f7f2]">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-normal mb-4 text-[#1F376A]">Trusted by Professionals</h2>
          <p className="text-[#333333] text-lg">
            Join thousands of satisfied talent and employers on XMetX
          </p>
        </motion.div>

        <div className="relative flex flex-col antialiased">
          <div className="relative flex overflow-hidden py-4">
            <div className="animate-marquee flex min-w-full shrink-0 items-stretch gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={`${index}-1`} className="w-[400px] shrink-0 bg-[#f9f7f2]/90 backdrop-blur-xl border-[#5C92C7]/20 hover:border-[#3D6B9C]/40 transition-all duration-300 p-8 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-12 w-12 border-2 border-[#5C92C7]/30">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback className="bg-[#5C92C7] text-white">{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-[#1F376A]">{testimonial.name}</h4>
                      <p className="text-sm text-[#3D6B9C]">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-[#333333] leading-relaxed">
                    {testimonial.content}
                  </p>
                </Card>
              ))}
            </div>
            <div className="animate-marquee flex min-w-full shrink-0 items-stretch gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={`${index}-2`} className="w-[400px] shrink-0 bg-[#f9f7f2]/90 backdrop-blur-xl border-[#5C92C7]/20 hover:border-[#3D6B9C]/40 transition-all duration-300 p-8 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-12 w-12 border-2 border-[#5C92C7]/30">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback className="bg-[#5C92C7] text-white">{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-[#1F376A]">{testimonial.name}</h4>
                      <p className="text-sm text-[#3D6B9C]">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-[#333333] leading-relaxed">
                    {testimonial.content}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
