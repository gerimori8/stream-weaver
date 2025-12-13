import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Link2, Loader2, Check, AlertCircle, Sparkles } from "lucide-react";
import { FormatSelector } from "./FormatSelector";
import { toast } from "@/hooks/use-toast";

export const DownloadCard = () => {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"mp3" | "mp4">("mp3");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValidYouTubeUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
    return regex.test(url);
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
    
    // Simulate API call - will be replaced with actual RapidAPI integration
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsSuccess(true);
    
    toast({
      title: "¡Descarga lista!",
      description: `Tu archivo ${format.toUpperCase()} está preparado`,
    });

    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
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
                onChange={(e) => setUrl(e.target.value)}
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
            <FormatSelector format={format} onChange={setFormat} />
          </motion.div>

          {/* Download Button */}
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
                ) : isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-3"
                  >
                    <Check className="w-5 h-5" />
                    <span>¡Completado!</span>
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
                    <span>Descargar {format.toUpperCase()}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>

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
