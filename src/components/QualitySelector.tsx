import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Music, Video, Sparkles, Check } from "lucide-react";
import { useState } from "react";

export interface QualityOption {
  url: string;
  quality: string;
  fileSize?: string;
  bitrate?: string;
  hasAudio?: boolean;
}

interface QualitySelectorProps {
  qualities: QualityOption[];
  selectedQuality: string;
  onChange: (quality: string) => void;
  format: "mp3" | "mp4" | "av1";
}

export const QualitySelector = ({
  qualities,
  selectedQuality,
  onChange,
  format,
}: QualitySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selected = qualities.find((q) => q.quality === selectedQuality);
  const Icon = format === "mp3" ? Music : Video;

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="w-4 h-4 text-primary" />
          </motion.div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">
              {selected?.quality || "Seleccionar calidad"}
            </p>
            {selected?.fileSize && (
              <p className="text-xs text-muted-foreground">{selected.fileSize}</p>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 py-2 rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl overflow-hidden"
          >
            {/* Best quality label */}
            {qualities.length > 0 && (
              <div className="px-4 py-2 border-b border-border/30">
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Sparkles className="w-3 h-3" />
                  <span>Mejor calidad disponible: {qualities[0].quality}</span>
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto">
              {qualities.map((quality, index) => (
                <motion.button
                  key={quality.quality}
                  type="button"
                  onClick={() => {
                    onChange(quality.quality);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors ${
                    selectedQuality === quality.quality ? "bg-primary/10" : ""
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        index === 0
                          ? "bg-primary/20 text-primary"
                          : "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {selectedQuality === quality.quality ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <p
                        className={`text-sm font-medium ${
                          selectedQuality === quality.quality
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {quality.quality}
                      </p>
                      {(format === "mp4" || format === "av1") && quality.hasAudio === false && (
                        <p className="text-xs text-amber-500">Solo video (sin audio)</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {quality.fileSize && (
                      <p className="text-xs text-muted-foreground">{quality.fileSize}</p>
                    )}
                    {index === 0 && (
                      <motion.span
                        className="text-xs text-primary font-medium"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Recomendado
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {qualities.length === 0 && (
              <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                No hay calidades disponibles
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
