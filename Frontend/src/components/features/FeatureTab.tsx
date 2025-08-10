import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureTabProps {
  icon: ReactNode;
  title: string;
  description: string;
  isActive: boolean;
}

export const FeatureTab = ({ icon, title, description, isActive }: FeatureTabProps) => {
  return (
    <div 
      className={`
        w-full flex items-center gap-4 p-5 rounded-xl
        transition-all duration-300 relative bg-[#f9f7f2]
        ${isActive 
          ? 'glass shadow-lg shadow-[#1F376A]/10 border border-[#5C92C7]/30' 
          : 'hover:glass-hover border border-[#5C92C7]/10 hover:border-[#3D6B9C]/30'
        }
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute left-0 top-0 w-1 h-full bg-[#1F376A] rounded-l-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <div className="flex items-center gap-4 min-w-0">
        <div className={`${isActive ? 'text-[#1F376A]' : 'text-[#5C92C7]'}`}>
          {icon}
        </div>
        <div className="text-left min-w-0">
          <h3 className={`font-semibold truncate text-base ${isActive ? 'text-[#1F376A]' : 'text-[#333333]'}`}>
            {title}
          </h3>
          <p className="text-sm text-[#333333]/70 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
