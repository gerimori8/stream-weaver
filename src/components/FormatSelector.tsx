import { motion } from "framer-motion";
import { Music, Video } from "lucide-react";

interface FormatSelectorProps {
  format: "mp3" | "mp4";
  onChange: (format: "mp3" | "mp4") => void;
}

export const FormatSelector = ({ format, onChange }: FormatSelectorProps) => {
  return (
    <div className="format-toggle">
      {/* Animated background pill */}
      <motion.div
        className="absolute h-[calc(100%-12px)] rounded-lg bg-primary"
        initial={false}
        animate={{
          x: format === "mp3" ? 6 : "calc(100% - 6px)",
          width: format === "mp3" ? "calc(50% - 6px)" : "calc(50% - 6px)",
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
        className={`format-btn flex items-center gap-2 ${format === "mp3" ? "active" : ""}`}
      >
        <Music className="w-4 h-4" />
        <span>MP3</span>
      </button>

      <button
        onClick={() => onChange("mp4")}
        className={`format-btn flex items-center gap-2 ${format === "mp4" ? "active" : ""}`}
      >
        <Video className="w-4 h-4" />
        <span>MP4</span>
      </button>
    </div>
  );
};
