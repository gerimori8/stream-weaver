import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { Youtube } from "lucide-react";

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
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Youtube className="w-5 h-5 text-primary" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            Aura<span className="text-primary">DL</span>
          </span>
        </motion.div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </motion.header>
  );
};
