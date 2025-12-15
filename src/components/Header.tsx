import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { Download } from "lucide-react";

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-primary/20" />
            <Download className="w-5 h-5 text-primary" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            Tube<span className="text-primary">Grab</span>
          </span>
        </motion.div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </motion.header>
  );
};
