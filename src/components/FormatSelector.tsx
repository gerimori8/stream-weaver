import { motion, AnimatePresence } from "framer-motion";
import { Music, Video, Sparkles } from "lucide-react";

interface FormatSelectorProps {
  format: "mp3" | "mp4";
  onChange: (format: "mp3" | "mp4") => void;
}

export const FormatSelector = ({ format, onChange }: FormatSelectorProps) => {
  return (
    <div className="w-full">
      <div className="format-toggle w-full relative">
        {/* Animated background pill */}
        <motion.div
          className="absolute top-1.5 bottom-1.5 rounded-lg bg-primary overflow-hidden"
          initial={false}
          animate={{
            left: format === "mp3" ? "6px" : "calc(50% + 2px)",
            width: "calc(50% - 8px)",
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
          }}
          style={{
            boxShadow: "0 4px 15px hsl(var(--primary) / 0.4)",
          }}
        >
          {/* Shimmer effect on active */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        </motion.div>

        {/* MP3 Button */}
        <motion.button
          onClick={() => onChange("mp3")}
          className={`format-btn flex-1 flex items-center justify-center gap-2 ${format === "mp3" ? "active" : ""}`}
          whileHover={{ scale: format === "mp3" ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={format === "mp3" ? { 
              rotate: [0, -10, 10, 0],
              scale: [1, 1.2, 1]
            } : {}}
            transition={{ duration: 0.5 }}
          >
            <Music className="w-4 h-4" />
          </motion.div>
          <span>MP3</span>
          <AnimatePresence mode="wait">
            {format === "mp3" && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* MP4 Button */}
        <motion.button
          onClick={() => onChange("mp4")}
          className={`format-btn flex-1 flex items-center justify-center gap-2 ${format === "mp4" ? "active" : ""}`}
          whileHover={{ scale: format === "mp4" ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={format === "mp4" ? { 
              rotate: [0, -10, 10, 0],
              scale: [1, 1.2, 1]
            } : {}}
            transition={{ duration: 0.5 }}
          >
            <Video className="w-4 h-4" />
          </motion.div>
          <span>MP4</span>
          <AnimatePresence mode="wait">
            {format === "mp4" && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Format description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={format}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-muted-foreground mt-2 text-center"
        >
          {format === "mp3" 
            ? "Audio • Mejor calidad disponible" 
            : "Video • Hasta 1080p Full HD"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};
