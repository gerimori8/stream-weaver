import { motion } from "framer-motion";
import { Clock, User, Music, Video, Sparkles } from "lucide-react";
import { formatDuration } from "@/lib/api";

interface VideoPreviewProps {
  title: string;
  thumbnail: string;
  duration: number;
  channel: string;
  quality: string;
  format: string;
  fileSize?: string;
}

export const VideoPreview = ({
  title,
  thumbnail,
  duration,
  channel,
  quality,
  format,
  fileSize,
}: VideoPreviewProps) => {
  const isAudio = format === 'mp3';
  
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
        </div>
      </div>
      
      {/* Quality Badge - Highlighted */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {isAudio ? (
            <Music className="w-4 h-4 text-primary" />
          ) : (
            <Video className="w-4 h-4 text-primary" />
          )}
          <span className="text-sm font-medium text-foreground">
            {format.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-sm font-semibold text-primary">
            {quality}
          </span>
          {fileSize && (
            <span className="text-xs text-muted-foreground ml-2">
              ({fileSize})
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
