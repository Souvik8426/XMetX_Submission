import { motion } from "framer-motion";

interface FeatureContentProps {
  image: string;
  title: string;
}

export const FeatureContent = ({ image, title }: FeatureContentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex items-center justify-center bg-[#f9f7f2]"
    >
      <div className="glass rounded-xl overflow-hidden w-full relative border border-[#5C92C7]/20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5C92C7]/10 to-transparent" />
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain relative z-10"
        />
      </div>
    </motion.div>
  );
};
