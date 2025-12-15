import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Link2, Loader2, Check, AlertCircle, Sparkles, ExternalLink } from "lucide-react";
import { FormatSelector } from "./FormatSelector";
import { VideoPreview } from "./VideoPreview";
import { DownloadProgress } from "./DownloadProgress";
import { toast } from "@/hooks/use-toast";
import { downloadVideo, triggerDownload, extractVideoId, type DownloadResponse } from "@/lib/api";

export const DownloadCard = () => {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"mp3" | "mp4">("mp3");
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<DownloadResponse | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "complete">("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);

  const isValidYouTubeUrl = (url: string) => {
    return extractVideoId(url) !== null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL requerida",
        description: "Por favor, introduce un enlace de YouTube",
        variant: "destructive",
      });
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      toast({
        title: "URL inválida",
        description: "Por favor, introduce un enlace válido de YouTube",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setVideoInfo(null);
    setDownloadStatus("idle");
    setDownloadProgress(0);
    
    const result = await downloadVideo(url, format);
    
    setIsLoading(false);

    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "No se pudo procesar el video",
        variant: "destructive",
      });
      return;
    }

    setVideoInfo(result);
    
    toast({
      title: "¡Listo para descargar!",
      description: `${result.title?.slice(0, 40)}...`,
    });
  };

  const handleDownload = () => {
    if (videoInfo?.downloadUrl && videoInfo.title) {
      setDownloadStatus("downloading");
      setDownloadProgress(0);
      
      // Simulate progress (since we can't track actual download progress with direct links)
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const filename = `${videoInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
      triggerDownload(videoInfo.downloadUrl, filename);
      
      // Complete after a short delay
      setTimeout(() => {
        clearInterval(progressInterval);
        setDownloadProgress(100);
        setDownloadStatus("complete");
        
        toast({
          title: "¡Descarga iniciada!",
          description: "El archivo se está descargando en tu navegador.",
        });
      }, 1500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-radial from-champagne/10 to-transparent rounded-full blur-3xl" />
        
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* URL Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Enlace de YouTube
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setVideoInfo(null);
                }}
                placeholder="https://youtube.com/watch?v=..."
                className="input-elegant pr-12"
                disabled={isLoading}
              />
              <AnimatePresence mode="wait">
                {url && isValidYouTubeUrl(url) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <Check className="w-5 h-5 text-forest" />
                  </motion.div>
                )}
                {url && !isValidYouTubeUrl(url) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Format Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-muted-foreground">
              Formato de salida
            </label>
            <FormatSelector 
              format={format} 
              onChange={(f) => {
                setFormat(f);
                setVideoInfo(null);
              }} 
            />
          </motion.div>

          {/* Process Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              type="submit"
              disabled={isLoading || !url}
              className="btn-primary w-full flex items-center justify-center gap-3 text-lg"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Procesando...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Download className="w-5 h-5" />
                    <span>Obtener {format.toUpperCase()}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>

        {/* Video Preview */}
        <AnimatePresence>
          {videoInfo && videoInfo.success && (
            <>
              <VideoPreview
                title={videoInfo.title || 'Video'}
                thumbnail={videoInfo.thumbnail || ''}
                duration={videoInfo.duration || 0}
                channel={videoInfo.channel || 'Unknown'}
                quality={videoInfo.quality || ''}
                format={videoInfo.format || format}
                fileSize={videoInfo.fileSize}
              />
              
              {/* Download Progress */}
              {downloadStatus !== "idle" && (
                <DownloadProgress 
                  progress={Math.round(downloadProgress)} 
                  status={downloadStatus} 
                />
              )}
              
              {downloadStatus === "idle" && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleDownload}
                  className="mt-4 w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Ahora</span>
                </motion.button>
              )}
              
              {downloadStatus === "complete" && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setDownloadStatus("idle");
                    setDownloadProgress(0);
                  }}
                  className="mt-4 w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar de nuevo</span>
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Shimmer effect when loading */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 shimmer pointer-events-none rounded-3xl"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
