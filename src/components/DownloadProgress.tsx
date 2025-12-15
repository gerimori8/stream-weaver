import { motion } from "framer-motion";
import { Download, Check, Loader2 } from "lucide-react";

interface DownloadProgressProps {
  progress: number;
  status: "idle" | "downloading" | "complete";
}

export const DownloadProgress = ({ progress, status }: DownloadProgressProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/30"
    >
      {/* Status Label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {status === "downloading" && (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          )}
          {status === "complete" && (
            <Check className="w-4 h-4 text-green-500" />
          )}
          {status === "idle" && (
            <Download className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">
            {status === "idle" && "Listo para descargar"}
            {status === "downloading" && "Descargando..."}
            {status === "complete" && "¡Descarga completa!"}
          </span>
        </div>
        <span className="text-sm font-semibold text-primary">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Animated Glow */}
      {status === "downloading" && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              "0 0 10px hsl(var(--primary) / 0.1)",
              "0 0 20px hsl(var(--primary) / 0.2)",
              "0 0 10px hsl(var(--primary) / 0.1)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};