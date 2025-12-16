import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, Loader2, Sparkles } from "lucide-react";

interface DownloadProgressProps {
  progress: number;
  status: "idle" | "downloading" | "complete";
}

export const DownloadProgress = ({ progress, status }: DownloadProgressProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: "auto", scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/30 relative overflow-hidden"
    >
      {/* Animated background based on status */}
      <AnimatePresence mode="wait">
        {status === "downloading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
            style={{
              backgroundSize: "200% 100%",
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundPosition: ["0% 0%", "200% 0%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.1), transparent)",
                backgroundSize: "200% 100%",
              }}
            />
          </motion.div>
        )}
        {status === "complete" && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/10 to-green-500/5"
          />
        )}
      </AnimatePresence>

      {/* Status Label */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {status === "downloading" && (
              <motion.div
                key="downloading"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
              >
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </motion.div>
            )}
            {status === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Check className="w-4 h-4 text-green-500" />
              </motion.div>
            )}
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Download className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            <motion.span
              key={status}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-sm font-medium text-foreground"
            >
              {status === "idle" && "Listo para descargar"}
              {status === "downloading" && "Descargando..."}
              {status === "complete" && "¡Descarga completa!"}
            </motion.span>
          </AnimatePresence>
        </div>
        
        <motion.span 
          className="text-sm font-semibold text-primary flex items-center gap-1"
          animate={status === "complete" ? {
            scale: [1, 1.2, 1],
          } : {}}
          transition={{ duration: 0.3 }}
        >
          {status === "complete" && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: [0, 360] }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-3 h-3" />
            </motion.div>
          )}
          {progress}%
        </motion.span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden relative">
        {/* Progress Bar Fill */}
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            background: status === "complete" 
              ? "linear-gradient(90deg, hsl(142 76% 36%), hsl(160 84% 39%))"
              : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))",
          }}
        >
          {/* Shine effect on progress bar */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>

        {/* Glowing dot at progress end */}
        {status === "downloading" && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-lg"
            style={{
              left: `calc(${progress}% - 4px)`,
              boxShadow: "0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.5)",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Floating particles during download */}
      <AnimatePresence>
        {status === "downloading" && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary/60"
                initial={{ 
                  opacity: 0,
                  x: `${20 + i * 20}%`,
                  y: "100%"
                }}
                animate={{
                  opacity: [0, 1, 0],
                  y: ["100%", "0%"],
                  x: [`${20 + i * 20}%`, `${25 + i * 15}%`],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Success burst effect */}
      <AnimatePresence>
        {status === "complete" && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 rounded-xl border-2 border-green-500/50 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
