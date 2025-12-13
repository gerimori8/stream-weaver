import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";
import { formatDuration } from "@/lib/api";

interface VideoPreviewProps {
  title: string;
  thumbnail: string;
  duration: number;
  channel: string;
  quality: string;
  format: string;
}

export const VideoPreview = ({
  title,
  thumbnail,
  duration,
  channel,
  quality,
  format,
}: VideoPreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-6 p-4 rounded-2xl bg-muted/30 border border-border/30"
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="relative w-32 h-20 flex-shrink-0 rounded-xl overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-foreground/80 text-background text-xs font-medium">
            {formatDuration(duration)}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-2">
            {title}
          </h3>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {channel}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(duration)}
            </span>
          </div>
          <div className="mt-2 flex gap-2">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase">
              {format}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground text-xs font-medium">
              {quality}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
