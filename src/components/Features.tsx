import { motion } from "framer-motion";
import { Zap, Shield, Headphones, Film } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Ultra Rápido",
    description: "Procesamiento instantáneo",
  },
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Sin registro necesario",
  },
  {
    icon: Headphones,
    title: "Alta Calidad",
    description: "Audio cristalino 320kbps",
  },
  {
    icon: Film,
    title: "HD Video",
    description: "Hasta 4K disponible",
  },
];

export const Features = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto"
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + index * 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="text-center p-4 rounded-2xl bg-card/30 border border-border/30 backdrop-blur-sm
                     hover:bg-card/50 hover:border-primary/20 transition-all duration-300"
        >
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
            <feature.icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif font-medium text-foreground text-sm">{feature.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};
