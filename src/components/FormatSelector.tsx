import { motion } from "framer-motion";
import { Music, Video } from "lucide-react";

interface FormatSelectorProps {
  format: "mp3" | "mp4";
  onChange: (format: "mp3" | "mp4") => void;
}

export const FormatSelector = ({ format, onChange }: FormatSelectorProps) => {
  return (
    <div className="w-full">
      <p className="text-sm text-muted-foreground mb-3 font-medium">Formato de salida</p>
      <div className="format-toggle w-full">
        {/* Animated background pill */}
        <motion.div
          className="absolute top-1.5 bottom-1.5 rounded-lg bg-primary"
          initial={false}
          animate={{
            left: format === "mp3" ? "6px" : "calc(50% + 2px)",
            width: "calc(50% - 8px)",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          style={{
            boxShadow: "0 4px 12px hsl(var(--primary) / 0.3)",
          }}
        />

        <button
          onClick={() => onChange("mp3")}
          className={`format-btn flex-1 flex items-center justify-center gap-2 ${format === "mp3" ? "active" : ""}`}
        >
          <Music className="w-4 h-4" />
          <span>MP3</span>
          <span className="text-xs opacity-70">320kb</span>
        </button>

        <button
          onClick={() => onChange("mp4")}
          className={`format-btn flex-1 flex items-center justify-center gap-2 ${format === "mp4" ? "active" : ""}`}
        >
          <Video className="w-4 h-4" />
          <span>MP4</span>
          <span className="text-xs opacity-70">1080p</span>
        </button>
      </div>
    </div>
  );
};
