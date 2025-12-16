import { motion } from "framer-motion";
import { Zap, Shield, Headphones, Film } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Ultra Rápido",
    description: "Procesamiento instantáneo",
    color: "from-yellow-500/20 to-orange-500/20",
  },
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Sin registro necesario",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Headphones,
    title: "Mejor Calidad",
    description: "Audio disponible real",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Film,
    title: "HD Video",
    description: "Máxima calidad real",
    color: "from-purple-500/20 to-pink-500/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export const Features = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto"
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          variants={itemVariants}
          whileHover={{ 
            y: -8, 
            scale: 1.05,
            transition: { duration: 0.3, ease: "easeOut" } 
          }}
          whileTap={{ scale: 0.95 }}
          className="text-center p-4 rounded-2xl bg-card/30 border border-border/30 backdrop-blur-sm
                     hover:bg-card/50 hover:border-primary/30 transition-colors duration-300 cursor-pointer
                     relative overflow-hidden group"
        >
          {/* Animated gradient background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          />
          
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          />

          {/* Icon container */}
          <motion.div 
            className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center relative z-10"
            whileHover={{ 
              rotate: [0, -10, 10, -5, 5, 0],
              scale: 1.1,
            }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
              }}
            >
              <feature.icon className="w-6 h-6 text-primary" />
            </motion.div>
          </motion.div>
          
          <motion.h3 
            className="font-serif font-medium text-foreground text-sm relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            {feature.title}
          </motion.h3>
          <motion.p 
            className="text-xs text-muted-foreground mt-1 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            {feature.description}
          </motion.p>

          {/* Floating particles on hover */}
          <motion.div
            className="absolute top-2 right-2 w-1 h-1 rounded-full bg-primary/50 opacity-0 group-hover:opacity-100"
            animate={{
              y: [0, -10, 0],
              x: [0, 5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-champagne/50 opacity-0 group-hover:opacity-100"
            animate={{
              y: [0, -8, 0],
              x: [0, -3, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
