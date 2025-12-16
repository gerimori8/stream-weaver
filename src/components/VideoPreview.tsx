import { motion } from "framer-motion";
import { Clock, User, Music, Video, Sparkles, CheckCircle2 } from "lucide-react";
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="mt-6 p-4 rounded-2xl bg-muted/30 border border-border/30 relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-champagne/5"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="flex gap-4 relative z-10">
        {/* Thumbnail */}
        <motion.div 
          className="relative w-32 h-20 flex-shrink-0 rounded-xl overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <motion.img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Duration badge */}
          <motion.div 
            className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-foreground/80 text-background text-xs font-medium"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {formatDuration(duration)}
          </motion.div>

          {/* Play overlay effect */}
          <motion.div
            className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center"
            >
              {isAudio ? (
                <Music className="w-4 h-4 text-primary-foreground" />
              ) : (
                <Video className="w-4 h-4 text-primary-foreground" />
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <motion.h3 
            className="font-medium text-foreground text-sm line-clamp-2 mb-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h3>
          <motion.div 
            className="flex flex-wrap gap-3 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span 
              className="flex items-center gap-1"
              whileHover={{ scale: 1.05, color: "hsl(var(--primary))" }}
            >
              <User className="w-3 h-3" />
              {channel}
            </motion.span>
            <motion.span 
              className="flex items-center gap-1"
              whileHover={{ scale: 1.05, color: "hsl(var(--primary))" }}
            >
              <Clock className="w-3 h-3" />
              {formatDuration(duration)}
            </motion.span>
          </motion.div>
        </div>
      </div>
      
      {/* Quality Badge - Highlighted */}
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between relative overflow-hidden"
      >
        {/* Animated shine */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />

        <motion.div 
          className="flex items-center gap-2 relative z-10"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            {isAudio ? (
              <Music className="w-4 h-4 text-primary" />
            ) : (
              <Video className="w-4 h-4 text-primary" />
            )}
          </motion.div>
          <span className="text-sm font-medium text-foreground">
            {format.toUpperCase()}
          </span>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <CheckCircle2 className="w-4 h-4 text-forest" />
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-2 relative z-10"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-primary" />
          </motion.div>
          <span className="text-sm font-semibold text-primary">
            {quality}
          </span>
          {fileSize && (
            <motion.span 
              className="text-xs text-muted-foreground ml-2 px-2 py-0.5 rounded-full bg-muted/50"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              {fileSize}
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Corner decorations */}
      <motion.div
        className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary/30"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-champagne/40"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
    </motion.div>
  );
};
