import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { DownloadCard } from "@/components/DownloadCard";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { Features } from "@/components/Features";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <BackgroundDecor />
      <Header />

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4"
            >
              YouTube → MP3 / MP4
            </motion.p>
            
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-6 leading-tight">
              Tube<span className="text-gradient-gold">Grab</span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed"
            >
              Descarga videos de YouTube en MP3 o MP4 con la mejor calidad disponible.
            </motion.p>
          </motion.div>

          {/* Download Card */}
          <DownloadCard />

          {/* Features */}
          <Features />

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 text-sm text-muted-foreground/60"
          >
            Diseñado con pasión • Sin límites de descargas
          </motion.p>
        </div>
      </main>
    </div>
  );
};

export default Index;
